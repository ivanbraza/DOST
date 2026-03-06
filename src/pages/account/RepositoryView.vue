<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import InnerLayoutWrapper from '@/layouts/InnerLayoutWrapper.vue'
import { useDocumentsDataStore } from '@/stores/documentsData'

const docsStore = useDocumentsDataStore()
const router = useRouter()
const { loading, error, adminVersionItems } = storeToRefs(docsStore)

const versionTags = (item: any): string[] => {
  const raw = item?.version?.tags
  if (!raw) return []
  if (Array.isArray(raw)) return raw.filter((t) => typeof t === 'string') as string[]
  if (typeof raw === 'object') {
    return Object.values(raw).filter((t) => typeof t === 'string') as string[]
  }
  return []
}

const getProgress = (item: any): number => {
  const status = (item.version?.status || '').toLowerCase()
  if (status === 'approved') return 66
  if (status === 'rejected') return 20
  if (status === 'pending') return 48
  return 0
}

// UI filter state (applies to version status)
const filter = ref<'all' | 'pending' | 'approved' | 'rejected'>('all')

// Temporary mock data so UI has something to render when empty
const useMockData = ref(true)

const mockAdminVersionItems = ref([
  {
    documentId: 'DOC-001',
    docTitle: 'Sample Research Proposal on Smart Farming',
    version: {
      v: 1,
      status: 'pending',
      created_at: new Date().toISOString(),
      file_url: null,
      tags: ['Agriculture', 'Smart Farming'],
    },
  },
  {
    documentId: 'DOC-002',
    docTitle: 'Climate Resilience Study for Coastal Communities',
    version: {
      v: 2,
      status: 'approved',
      created_at: new Date().toISOString(),
      file_url: null,
      tags: ['Climate', 'Coastal'],
    },
  },
  {
    documentId: 'DOC-003',
    docTitle: 'Aquaculture Monitoring Report for Agusan del Norte',
    version: {
      v: 1,
      status: 'rejected',
      created_at: new Date().toISOString(),
      file_url: null,
      tags: ['Aquaculture'],
    },
  },
])

const displayItems = computed(() => {
  const source = adminVersionItems.value && adminVersionItems.value.length
    ? adminVersionItems.value
    : (useMockData.value ? mockAdminVersionItems.value : [])

  if (filter.value === 'all') return source

  return source.filter((item: any) => {
    const status = (item.version?.status || '').toLowerCase()
    return status === filter.value
  })
})

const goToProject = (item: any) => {
  const id = item.documentId
  if (!id) return
  router.push({ path: `/account/repository/${id}` })
}

const loadDocs = async () => {
  try {
    await docsStore.fetchAdminVersionItems(filter.value)
  } catch (e) {
    console.error('Failed to load admin versions', e)
  }
}

onMounted(loadDocs)

watch(filter, () => {
  loadDocs()
})
</script>

<template>
  <InnerLayoutWrapper>
    <template #content>
      <v-container class="py-6">
        <!-- Header -->
        <v-row class="mb-6" align="center" justify="space-between">
          <v-col cols="12" md="6">
            <div class="text-h5 font-weight-bold mb-1">Assigned Projects</div>
            <div class="text-body-2 text-grey-darken-1">
              Review, approve, or reject submitted project versions.
            </div>
          </v-col>
          <v-col cols="12" md="6" class="d-flex justify-end align-center ga-3">
            <v-select
              v-model="filter"
              :items="[
                { title: 'All', value: 'all' },
                { title: 'Pending', value: 'pending' },
                { title: 'Approved', value: 'approved' },
                { title: 'Rejected', value: 'rejected' },
              ]"
              label="Filter by status"
              density="comfortable"
              hide-details
              style="max-width: 220px"
            />
            <v-btn
              color="primary"
              variant="elevated"
              prepend-icon="mdi-refresh"
              :loading="loading"
              @click="loadDocs()"
            >
              Refresh
            </v-btn>
          </v-col>
        </v-row>

        <!-- Error (non-blocking) -->
        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          class="mb-4"
        >
          {{ error }}
        </v-alert>

        <!-- Loading, empty, grid states -->
        <v-row v-if="loading">
          <v-col cols="12">
            <v-skeleton-loader type="card" class="mb-4" />
            <v-skeleton-loader type="card" class="mb-4" />
          </v-col>
        </v-row>

        <v-row v-else-if="!displayItems.length">
          <v-col cols="12" class="text-center py-10">
            <div class="text-subtitle-1 mb-2">No assigned projects found.</div>
            <div class="text-body-2 text-grey-darken-1">
              Try changing the filter or refreshing the list.
            </div>
          </v-col>
        </v-row>

        <!-- Versions Grid -->
        <v-row v-else>
          <v-col
            v-for="item in displayItems"
            :key="item.documentId + '-' + (item.version?.v || 0)"
            cols="12"
          >
            <v-card
              class="project-card"
              elevation="2"
              @click="goToProject(item)"
            >
              <v-card-text class="pa-5">
                <!-- Title + status chip -->
                <div class="d-flex justify-space-between align-start mb-3">
                  <div class="text-subtitle-1 font-weight-bold project-title">
                    {{ item.docTitle || 'Untitled Document' }}
                  </div>
                  <v-chip
                    v-if="item.version?.status"
                    size="small"
                    :color="item.version?.status === 'approved' ? 'success' : item.version?.status === 'rejected' ? 'error' : 'info'"
                    variant="elevated"
                  >
                    {{ (item.version?.status || 'pending').toUpperCase() }}
                  </v-chip>
                </div>

                <!-- Program / description -->
                <div class="text-caption text-grey-darken-1 mb-3">
                  Community Empowerment thru Science and Technology &amp; Smart and Sustainable Communities Program
                </div>

                <!-- Meta row -->
                <div class="d-flex flex-wrap align-center text-caption text-grey-darken-1 mb-4 ga-6 meta-row">
                  <div class="d-flex align-center ga-1">
                    <v-icon size="16">mdi-office-building-marker</v-icon>
                    <span>Provincial Science and Technology Office-Agusan del Norte</span>
                  </div>
                  <div class="d-flex align-center ga-1">
                    <v-icon size="16">mdi-account</v-icon>
                    <span>Meriam B. Bouquia</span>
                  </div>
                  <div class="d-flex align-center ga-1">
                    <v-icon size="16">mdi-calendar</v-icon>
                    <span>January 2025 - December 2025</span>
                  </div>
                </div>

                <!-- Optional tags row -->
                <div v-if="versionTags(item).length" class="d-flex flex-wrap ga-2 mb-3">
                  <v-chip
                    v-for="tag in versionTags(item)"
                    :key="tag"
                    size="small"
                    color="primary"
                    variant="tonal"
                    prepend-icon="mdi-tag"
                  >
                    {{ tag }}
                  </v-chip>
                </div>

                <!-- Progress -->
                <div class="mb-4">
                  <div class="d-flex justify-space-between mb-1 text-caption">
                    <span>Overall Progress</span>
                    <span>{{ getProgress(item) }}%</span>
                  </div>
                  <v-progress-linear
                    :model-value="getProgress(item)"
                    color="primary"
                    height="12"
                    rounded
                  />
                </div>

                <v-divider class="my-4" />

                <!-- Footer -->
                <div class="d-flex justify-space-between align-center">
                  <div class="text-caption text-grey-darken-1">
                    Total Cost: <strong>₱ 7M</strong>
                  </div>
                  <div
                    v-if="(item.version?.status || '').toLowerCase() === 'pending'"
                    class="d-flex ga-2"
                  >
                    <v-btn
                      color="success"
                      variant="elevated"
                      prepend-icon="mdi-check"
                      size="small"
                      @click.stop="docsStore.approveVersion(item.documentId, (item.version?.v || 0), filter)"
                    >
                      Approve
                    </v-btn>
                    <v-btn
                      color="error"
                      variant="elevated"
                      prepend-icon="mdi-close"
                      size="small"
                      @click.stop="docsStore.rejectVersion(item.documentId, (item.version?.v || 0), filter)"
                    >
                      Reject
                    </v-btn>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </template>
  </InnerLayoutWrapper>
</template>

<style scoped>
.project-card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  cursor: pointer;
}
.project-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

.project-title {
  max-width: 80%;
}

.meta-row {
  row-gap: 8px;
}
</style>
