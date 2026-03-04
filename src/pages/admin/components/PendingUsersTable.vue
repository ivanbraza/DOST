<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useUserApproval } from '@/composables/useUserApproval'
import { useUserRolesStore } from '@/stores/roles'
import { formatDate, getRoleTitle, getRoleColor } from '@/utils/helpers'
import UserApprovalDialog from '@/pages/admin/components/dialogs/UserApprovalDialog.vue'
import type { PendingUser, ApprovalAction } from '@/types/database'

// Composables
const { 
  pendingUsers, 
  loading, 
  fetchPendingUsers, 
  getUserDisplayName,
  isProcessing,
  pendingCount
} = useUserApproval()
const rolesStore = useUserRolesStore()

// State
const search = ref('')
const approvalDialog = ref(false)
const selectedUser = ref<PendingUser | null>(null)
const selectedAction = ref<ApprovalAction>('approve')

// Table headers
const headers = [
  { title: 'User', key: 'full_name', sortable: true },
  { title: 'Email', key: 'email', sortable: true },
  { title: 'Department', key: 'department', sortable: true },
  { title: 'Role', key: 'role_id', sortable: true },
  { title: 'Registered', key: 'created_at', sortable: true },
  { title: 'Email Status', key: 'email_verified', sortable: false },
  { title: 'Actions', key: 'actions', sortable: false, width: '150px' },
]

// Computed
const filteredUsers = computed(() => {
  if (!search.value) {
    return pendingUsers.value
  }

  const searchTerm = search.value.toLowerCase()
  return pendingUsers.value.filter(user =>
    (user.user_metadata?.full_name?.toLowerCase().includes(searchTerm)) ||
    (user.email?.toLowerCase().includes(searchTerm)) ||
    (user.user_metadata?.department?.toLowerCase().includes(searchTerm)) ||
    (user.user_metadata?.position?.toLowerCase().includes(searchTerm))
  )
})

// Methods
async function loadPendingUsers() {
  await rolesStore.fetchRoles()
  await fetchPendingUsers()
}

function openApprovalDialog(user: PendingUser, action: ApprovalAction) {
  selectedUser.value = user
  selectedAction.value = action
  approvalDialog.value = true
}

function handleActionCompleted(userId: string, action: ApprovalAction) {
  // User is already removed from the list by the composable
  console.log(`User ${userId} was ${action}d`)
}

// Lifecycle
onMounted(loadPendingUsers)
</script>

<template>
  <v-card>
    <v-card-title class="d-flex justify-space-between align-center">
      <div>
        <div class="d-flex align-center">
          <h3>Pending Registrations</h3>
          <v-chip
            v-if="pendingCount > 0"
            color="warning"
            variant="tonal"
            size="small"
            class="ml-2"
          >
            {{ pendingCount }}
          </v-chip>
        </div>
        <p class="text-subtitle-1 text-grey">
          Review and approve or reject user registrations
        </p>
      </div>
      <v-btn
        variant="outlined"
        prepend-icon="mdi-refresh"
        @click="loadPendingUsers"
        :loading="loading"
        size="small"
      >
        Refresh
      </v-btn>
    </v-card-title>

    <v-card-text>
      <!-- Search Field -->
      <v-row class="mb-4">
        <v-col cols="12" md="4">
          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            label="Search pending users..."
            single-line
            hide-details
            clearable
            density="compact"
          />
        </v-col>
      </v-row>

      <!-- Desktop Table View -->
      <div class="d-none d-md-block">
        <v-data-table
          :headers="headers"
          :items="pendingUsers"
          :loading="loading"
          class="elevation-1"
          item-key="id"
          :search="search"
          show-current-page
        >
          <template v-slot:item.full_name="{ item }">
            <div class="d-flex align-center">
              <v-avatar color="primary" size="32" class="mr-2">
                <span class="text-caption text-white">
                  {{ item.user_metadata?.full_name?.charAt(0) || item.email?.charAt(0) || '?' }}
                </span>
              </v-avatar>
              <div>
                <div class="font-weight-medium">
                  {{ getUserDisplayName(item) }}
                </div>
                <div class="text-caption text-grey">
                  {{ item.user_metadata?.position || 'No position' }}
                </div>
              </div>
            </div>
          </template>

          <template v-slot:item.department="{ item }">
            {{ item.user_metadata?.department || 'Not specified' }}
          </template>

          <template v-slot:item.role_id="{ item }">
            <v-chip
              v-if="item.user_metadata?.role"
              :color="getRoleColor(item.user_metadata.role)"
              variant="tonal"
              size="small"
            >
              {{ getRoleTitle(item.user_metadata.role, rolesStore.roles) }}
            </v-chip>
            <span v-else class="text-grey">Not assigned</span>
          </template>

          <template v-slot:item.created_at="{ item }">
            {{ formatDate(item.created_at ?? undefined) }}
          </template>

          <template v-slot:item.email_verified="{ item }">
            <v-chip
              :color="item.email_confirmed_at ? 'success' : 'warning'"
              variant="tonal"
              size="small"
            >
              <v-icon start size="small">
                {{ item.email_confirmed_at ? 'mdi-check-circle' : 'mdi-clock-outline' }}
              </v-icon>
              {{ item.email_confirmed_at ? 'Verified' : 'Pending' }}
            </v-chip>
          </template>

          <template v-slot:item.actions="{ item }">
            <v-btn
              icon
              variant="flat"
              size="small"
              color="success"
              class="mr-1"
              :loading="isProcessing(item.id)"
              :disabled="!item.email_confirmed_at"
              @click="openApprovalDialog(item, 'approve')"
            >
              <v-icon>mdi-check</v-icon>
              <v-tooltip activator="parent" location="top">
                {{ item.email_confirmed_at ? 'Approve' : 'Email not verified' }}
              </v-tooltip>
            </v-btn>
            <v-btn
              icon
              variant="flat"
              size="small"
              color="error"
              :loading="isProcessing(item.id)"
              @click="openApprovalDialog(item, 'reject')"
            >
              <v-icon>mdi-close</v-icon>
              <v-tooltip activator="parent" location="top">Reject</v-tooltip>
            </v-btn>
          </template>

          <template v-slot:no-data>
            <div class="text-center pa-8">
              <v-icon size="64" color="success" class="mb-4">
                mdi-check-circle-outline
              </v-icon>
              <p class="text-h6">No pending registrations</p>
              <p class="text-body-2 text-grey">
                All user registrations have been processed.
              </p>
            </div>
          </template>

          <template v-slot:loading>
            <v-skeleton-loader type="table-row@5"></v-skeleton-loader>
          </template>
        </v-data-table>
      </div>

      <!-- Mobile Card View -->
      <div class="d-block d-md-none">
        <v-row v-if="loading">
          <v-col cols="12" v-for="i in 3" :key="i">
            <v-skeleton-loader type="card"></v-skeleton-loader>
          </v-col>
        </v-row>

        <div v-else-if="filteredUsers.length === 0" class="text-center pa-8">
          <v-icon size="64" color="success">mdi-check-circle-outline</v-icon>
          <p class="text-h6 mt-4">No pending registrations</p>
          <p class="text-body-2 text-grey">
            All user registrations have been processed.
          </p>
        </div>

        <v-row v-else>
          <v-col cols="12" v-for="user in filteredUsers" :key="user.id">
            <v-card class="mb-3" elevation="2">
              <v-card-text>
                <div class="d-flex justify-space-between align-center mb-3">
                  <div class="d-flex align-center">
                    <v-avatar color="primary" size="40" class="mr-3">
                      <span class="text-body-2 text-white">
                        {{ user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || '?' }}
                      </span>
                    </v-avatar>
                    <div>
                      <div class="font-weight-medium">{{ getUserDisplayName(user) }}</div>
                      <div class="text-caption text-grey">{{ user.email }}</div>
                    </div>
                  </div>
                  <v-chip
                    :color="user.email_confirmed_at ? 'success' : 'warning'"
                    variant="tonal"
                    size="x-small"
                  >
                    {{ user.email_confirmed_at ? 'Verified' : 'Unverified' }}
                  </v-chip>
                </div>

                <v-row dense class="mb-3">
                  <v-col cols="6">
                    <div class="text-caption text-grey">Department</div>
                    <div class="text-body-2">
                      {{ user.user_metadata?.department || 'Not specified' }}
                    </div>
                  </v-col>
                  <v-col cols="6">
                    <div class="text-caption text-grey">Role</div>
                    <v-chip
                      v-if="user.user_metadata?.role"
                      :color="getRoleColor(user.user_metadata.role)"
                      variant="tonal"
                      size="x-small"
                    >
                      {{ getRoleTitle(user.user_metadata.role, rolesStore.roles) }}
                    </v-chip>
                    <span v-else class="text-body-2 text-grey">Not assigned</span>
                  </v-col>
                </v-row>

                <v-row dense>
                  <v-col cols="12">
                    <div class="text-caption text-grey">Registered</div>
                    <div class="text-body-2">{{ formatDate(user.created_at ?? undefined) }}</div>
                  </v-col>
                </v-row>

                <v-divider class="my-3" />

                <div class="d-flex justify-end">
                  <v-btn
                    variant="flat"
                    size="small"
                    color="success"
                    class="mr-2"
                    :loading="isProcessing(user.id)"
                    :disabled="!user.email_confirmed_at"
                    @click="openApprovalDialog(user, 'approve')"
                  >
                    <v-icon start>mdi-check</v-icon>
                    Approve
                  </v-btn>
                  <v-btn
                    variant="flat"
                    size="small"
                    color="error"
                    :loading="isProcessing(user.id)"
                    @click="openApprovalDialog(user, 'reject')"
                  >
                    <v-icon start>mdi-close</v-icon>
                    Reject
                  </v-btn>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </div>
    </v-card-text>

    <!-- Approval Dialog -->
    <UserApprovalDialog
      v-model="approvalDialog"
      :user="selectedUser"
      :action="selectedAction"
      @action-completed="handleActionCompleted"
    />
  </v-card>
</template>

<style scoped>
.v-card-title h3 {
  margin-bottom: 4px;
}
</style>
