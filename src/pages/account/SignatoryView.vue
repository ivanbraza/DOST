<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'
import InnerLayoutWrapper from '@/layouts/InnerLayoutWrapper.vue'
import { useDocumentsDataStore, type Document } from '@/stores/documentsData'
import { useAuthUserStore } from '@/stores/authUser'

type SignatoryDecision = 'approved' | 'revision_needed'

type SignatoryReviewEntry = {
  by: string
  at: string
  decision: SignatoryDecision
  comment?: string
}

type SignatoryFlow = {
  signatories: string[]
  currentIndex: number
  reviews?: SignatoryReviewEntry[]
}

const docsStore = useDocumentsDataStore()
const authStore = useAuthUserStore()
const toast = useToast()

const { documents, loading, error } = storeToRefs(docsStore)

const selectedDocumentId = ref<number | null>(null)
const reviewComment = ref('')
const actionLoading = ref(false)

const normalize = (value: unknown) => String(value ?? '').trim().toLowerCase()

const currentUserTokens = computed(() => {
  const user = authStore.userData
  if (!user) return [] as string[]

  const fullName = user.user_metadata?.full_name || user.full_name

  return [
    user.id,
    user.email,
    fullName,
  ]
    .map(v => normalize(v))
    .filter(Boolean)
})

function getObjectRecord(input: unknown): Record<string, unknown> {
  if (input && typeof input === 'object' && !Array.isArray(input)) {
    return input as Record<string, unknown>
  }
  return {}
}

function extractSignatoriesFromDocument(doc: Document): string[] {
  const tags = getObjectRecord(doc.tags)
  const collaborators = getObjectRecord(doc.collaborators)

  const candidates: unknown[] = [
    tags.signatories,
    tags.tagged_signatories,
    tags.signatory,
    collaborators.signatories,
    collaborators.tagged_signatories,
    collaborators.signatory,
  ]

  const extracted = new Set<string>()

  const appendValue = (item: unknown) => {
    if (!item) return

    if (typeof item === 'string' || typeof item === 'number') {
      const val = normalize(item)
      if (val) extracted.add(val)
      return
    }

    if (Array.isArray(item)) {
      item.forEach(appendValue)
      return
    }

    if (typeof item === 'object') {
      const obj = item as Record<string, unknown>
      appendValue(obj.id)
      appendValue(obj.user_id)
      appendValue(obj.email)
      appendValue(obj.name)
      Object.values(obj).forEach(v => {
        if (typeof v === 'string' || typeof v === 'number') appendValue(v)
      })
    }
  }

  candidates.forEach(appendValue)

  return Array.from(extracted)
}

function getSignatoryFlow(doc: Document): SignatoryFlow {
  const collaborators = getObjectRecord(doc.collaborators)
  const flow = getObjectRecord(collaborators.signatory_flow)

  const signatoriesRaw = Array.isArray(flow.signatories) ? flow.signatories : extractSignatoriesFromDocument(doc)
  const signatories = signatoriesRaw
    .map(item => normalize(item))
    .filter(Boolean)

  const currentIndexRaw = Number(flow.currentIndex)
  const safeIndex = Number.isFinite(currentIndexRaw) && currentIndexRaw >= 0 ? currentIndexRaw : 0

  const reviews = Array.isArray(flow.reviews)
    ? (flow.reviews as SignatoryReviewEntry[])
    : []

  return {
    signatories,
    currentIndex: safeIndex,
    reviews,
  }
}

function getCurrentAssignee(doc: Document): string {
  const flow = getSignatoryFlow(doc)
  return normalize(flow.signatories[flow.currentIndex])
}

const pendingQueue = computed(() => {
  const userSet = new Set(currentUserTokens.value)
  if (userSet.size === 0) return []

  return (documents.value || []).filter((doc) => {
    const status = normalize(doc.status)
    if (status === 'approved') return false

    const assignee = getCurrentAssignee(doc)
    if (!assignee) return false

    return userSet.has(assignee)
  })
})

const selectedDocument = computed(() =>
  pendingQueue.value.find(doc => doc.id === selectedDocumentId.value) || pendingQueue.value[0],
)

const selectedFlow = computed(() => {
  if (!selectedDocument.value) return null
  return getSignatoryFlow(selectedDocument.value)
})

const activeStepLabel = computed(() => {
  if (!selectedFlow.value) return '—'
  const index = selectedFlow.value.currentIndex
  const total = selectedFlow.value.signatories.length
  if (total === 0) return 'No signatory tags found'
  return `Step ${index + 1} of ${total}`
})

function openCurrentDocumentFile() {
  if (!selectedDocument.value) return
  docsStore.openDocumentWithLog(selectedDocument.value)
}

async function saveFlowState(doc: Document, flow: SignatoryFlow, status: 'pending' | 'approved') {
  const collaborators = getObjectRecord(doc.collaborators)

  await docsStore.updateDocument(doc.id, {
    status,
    collaborators: {
      ...collaborators,
      signatory_flow: flow,
    },
  })
}

async function applyDecision(decision: SignatoryDecision) {
  if (!selectedDocument.value || !selectedFlow.value) return
  if (decision === 'revision_needed' && !reviewComment.value.trim()) {
    toast.error('Comment is required when requesting revision.')
    return
  }

  const doc = selectedDocument.value
  const flow = selectedFlow.value
  const nowIso = new Date().toISOString()
  const reviewer = authStore.userData?.id || authStore.userData?.email || 'unknown'

  const updatedFlow: SignatoryFlow = {
    ...flow,
    reviews: [
      ...(flow.reviews || []),
      {
        by: reviewer,
        at: nowIso,
        decision,
        comment: reviewComment.value.trim() || undefined,
      },
    ],
  }

  actionLoading.value = true
  try {
    if (decision === 'revision_needed') {
      await docsStore.setCurrentVersionStatus(doc.id, 'pending')
      await saveFlowState(doc, updatedFlow, 'pending')
      toast.warning('Revision requested. Document stays in pending state.')
    } else {
      const hasNext = updatedFlow.currentIndex < (updatedFlow.signatories.length - 1)

      if (hasNext) {
        updatedFlow.currentIndex += 1
        await docsStore.setCurrentVersionStatus(doc.id, 'pending')
        await saveFlowState(doc, updatedFlow, 'pending')
        toast.success('Accepted and forwarded to the next signatory.')
      } else {
        await docsStore.setCurrentVersionStatus(doc.id, 'approved')
        await saveFlowState(doc, updatedFlow, 'approved')
        toast.success('Final signatory accepted. Document marked approved.')
      }
    }

    reviewComment.value = ''
    await docsStore.fetchDocuments()

    const first = pendingQueue.value[0]
    selectedDocumentId.value = first?.id ?? null
  } catch (err) {
    console.error('Failed to process signatory action:', err)
    toast.error('Failed to process action. Please try again.')
  } finally {
    actionLoading.value = false
  }
}

onMounted(async () => {
  await authStore.initializeAuth()
  await docsStore.fetchDocuments()
  selectedDocumentId.value = pendingQueue.value[0]?.id ?? null
})
</script>

<template>
  <InnerLayoutWrapper>
    <template #content>
      <v-container fluid class="pa-6">
        <v-row class="mb-4">
          <v-col cols="12">
            <h1 class="text-h4 font-weight-bold mb-1">Signatory Review</h1>
            <p class="text-body-1 text-grey-darken-1">
              Review assigned documents, request revision with comment, or accept and pass to the next checker.
            </p>
          </v-col>
        </v-row>

        <v-row v-if="error">
          <v-col cols="12">
            <v-alert type="error" variant="tonal" class="mb-4">{{ error }}</v-alert>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" md="4">
            <v-card elevation="2" class="h-100">
              <v-card-title class="d-flex align-center justify-space-between">
                <span>My Queue</span>
                <v-chip size="small" color="primary" variant="tonal">{{ pendingQueue.length }}</v-chip>
              </v-card-title>
              <v-divider />

              <v-list v-if="pendingQueue.length > 0" lines="two">
                <v-list-item
                  v-for="doc in pendingQueue"
                  :key="doc.id"
                  :active="selectedDocument?.id === doc.id"
                  @click="selectedDocumentId = doc.id"
                >
                  <v-list-item-title>{{ doc.title || `Document #${doc.id}` }}</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ normalize(doc.status || 'pending') }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>

              <v-card-text v-else class="text-grey-darken-1">
                No pending signatory documents assigned to your account.
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="8">
            <v-card elevation="2" class="h-100" v-if="selectedDocument">
              <v-card-title class="d-flex flex-wrap align-center ga-2 justify-space-between">
                <span>{{ selectedDocument.title || `Document #${selectedDocument.id}` }}</span>
                <v-chip size="small" color="info" variant="tonal">{{ activeStepLabel }}</v-chip>
              </v-card-title>
              <v-divider />

              <v-card-text>
                <div class="d-flex flex-wrap ga-2 mb-4">
                  <v-btn color="primary" prepend-icon="mdi-open-in-new" @click="openCurrentDocumentFile">
                    Check File
                  </v-btn>
                  <v-chip size="small" variant="outlined">
                    Status: {{ normalize(selectedDocument.status || 'pending') }}
                  </v-chip>
                </div>

                <v-textarea
                  v-model="reviewComment"
                  label="Comment"
                  hint="Required for revision request"
                  persistent-hint
                  rows="4"
                  variant="outlined"
                />
              </v-card-text>

              <v-card-actions class="px-4 pb-4 d-flex justify-space-between">
                <v-btn
                  color="warning"
                  variant="tonal"
                  prepend-icon="mdi-comment-alert-outline"
                  :loading="actionLoading"
                  @click="applyDecision('revision_needed')"
                >
                  Request Revision
                </v-btn>

                <v-btn
                  color="success"
                  prepend-icon="mdi-check"
                  :loading="actionLoading"
                  @click="applyDecision('approved')"
                >
                  Accept & Pass Next
                </v-btn>
              </v-card-actions>
            </v-card>

            <v-card v-else elevation="2">
              <v-card-text class="text-grey-darken-1">
                Select a document from your queue to review.
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-row v-if="loading" class="mt-2">
          <v-col cols="12">
            <v-progress-linear color="primary" indeterminate rounded />
          </v-col>
        </v-row>
      </v-container>
    </template>
  </InnerLayoutWrapper>
</template>