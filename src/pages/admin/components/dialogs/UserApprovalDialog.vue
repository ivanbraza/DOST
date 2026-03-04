<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { PendingUser, ApprovalAction } from '@/types/database'
import { useUserApproval } from '@/composables/useUserApproval'
import { useUserRolesStore } from '@/stores/roles'
import { formatDate, getRoleTitle, getRoleColor } from '@/utils/helpers'

// Props
const props = defineProps<{
  modelValue: boolean
  user: PendingUser | null
  action: ApprovalAction
}>()

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'action-completed': [userId: string, action: ApprovalAction]
}>()

// Composables
const { processUserAction, getUserDisplayName, isProcessing } = useUserApproval()
const rolesStore = useUserRolesStore()

// State
const processing = ref(false)
const comments = ref('')

// Computed
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isApproval = computed(() => props.action === 'approve')

const dialogTitle = computed(() => 
  isApproval.value ? 'Approve User Registration' : 'Reject User Registration'
)

const dialogIcon = computed(() =>
  isApproval.value ? 'mdi-check-circle' : 'mdi-close-circle'
)

const dialogColor = computed(() =>
  isApproval.value ? 'success' : 'error'
)

const confirmButtonText = computed(() =>
  isApproval.value ? 'Approve User' : 'Reject & Delete'
)

const confirmButtonIcon = computed(() =>
  isApproval.value ? 'mdi-check' : 'mdi-delete'
)

const warningMessage = computed(() =>
  isApproval.value
    ? 'This will grant the user access to the system based on their assigned role.'
    : 'This will permanently delete the user account. This action cannot be undone.'
)

// Methods
async function handleConfirm() {
  if (!props.user) return
  
  processing.value = true
  
  try {
    const result = await processUserAction(
      props.user.id, 
      props.action,
      comments.value || undefined
    )
    
    if (result.success) {
      emit('action-completed', props.user.id, props.action)
      dialogVisible.value = false
    }
  } finally {
    processing.value = false
  }
}

function handleCancel() {
  dialogVisible.value = false
}

// Reset comments when dialog closes
watch(dialogVisible, (isOpen) => {
  if (!isOpen) {
    comments.value = ''
  }
})
</script>

<template>
  <v-dialog
    v-model="dialogVisible"
    max-width="500"
    persistent
  >
    <v-card>
      <v-card-title class="d-flex align-center pa-4">
        <v-icon :color="dialogColor" class="mr-2">{{ dialogIcon }}</v-icon>
        {{ dialogTitle }}
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-4">
        <!-- User Info Card -->
        <v-card variant="outlined" class="mb-4">
          <v-card-text>
            <div class="d-flex align-center mb-3">
              <v-avatar color="primary" size="48" class="mr-3">
                <span class="text-h6 text-white">
                  {{ user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || '?' }}
                </span>
              </v-avatar>
              <div>
                <div class="text-subtitle-1 font-weight-bold">
                  {{ user ? getUserDisplayName(user) : 'Unknown User' }}
                </div>
                <div class="text-body-2 text-grey">
                  {{ user?.email || 'No email' }}
                </div>
              </div>
            </div>

            <v-row dense>
              <v-col cols="6">
                <div class="text-caption text-grey">Department</div>
                <div class="text-body-2">
                  {{ user?.user_metadata?.department || 'Not specified' }}
                </div>
              </v-col>
              <v-col cols="6">
                <div class="text-caption text-grey">Position</div>
                <div class="text-body-2">
                  {{ user?.user_metadata?.position || 'Not specified' }}
                </div>
              </v-col>
            </v-row>

            <v-row dense class="mt-2">
              <v-col cols="6">
                <div class="text-caption text-grey">Role</div>
                <v-chip
                  v-if="user?.user_metadata?.role"
                  :color="getRoleColor(user.user_metadata.role)"
                  variant="tonal"
                  size="small"
                >
                  {{ getRoleTitle(user.user_metadata.role, rolesStore.roles) }}
                </v-chip>
                <span v-else class="text-body-2">Not assigned</span>
              </v-col>
              <v-col cols="6">
                <div class="text-caption text-grey">Registered</div>
                <div class="text-body-2">
                  {{ user?.created_at ? formatDate(user.created_at) : 'Unknown' }}
                </div>
              </v-col>
            </v-row>

            <v-row dense class="mt-2">
              <v-col cols="12">
                <div class="text-caption text-grey">Email Verified</div>
                <v-chip
                  :color="user?.email_confirmed_at ? 'success' : 'warning'"
                  variant="tonal"
                  size="small"
                >
                  <v-icon start size="small">
                    {{ user?.email_confirmed_at ? 'mdi-check-circle' : 'mdi-clock-outline' }}
                  </v-icon>
                  {{ user?.email_confirmed_at ? 'Verified' : 'Pending' }}
                </v-chip>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Warning Alert -->
        <v-alert
          :type="isApproval ? 'info' : 'warning'"
          variant="tonal"
          density="compact"
          class="mb-4"
        >
          {{ warningMessage }}
        </v-alert>

        <!-- Optional Comments -->
        <v-textarea
          v-model="comments"
          label="Comments (optional)"
          variant="outlined"
          density="compact"
          rows="2"
          :placeholder="isApproval ? 'Add approval notes...' : 'Reason for rejection...'"
          hide-details
        />
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn
          variant="text"
          @click="handleCancel"
          :disabled="processing"
        >
          Cancel
        </v-btn>
        <v-btn
          :color="dialogColor"
          variant="elevated"
          :loading="processing"
          :prepend-icon="confirmButtonIcon"
          @click="handleConfirm"
        >
          {{ confirmButtonText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
