<script setup lang="ts">
import { ref, onMounted } from 'vue';
import InnerLayoutWrapper from '@/layouts/InnerLayoutWrapper.vue';
import UserManagementTable from './components/UserManagementTable.vue';
import PendingUsersTable from './components/PendingUsersTable.vue';
import { useUserApproval } from '@/composables/useUserApproval';

// State
const activeTab = ref('pending');

// Composables
const { pendingCount, fetchPendingUsers } = useUserApproval();

// Methods
onMounted(async () => {
  // Fetch pending count on mount for badge display
  await fetchPendingUsers();
});
</script>
<template>
  <InnerLayoutWrapper :hide-footer="true">
    <template #content>
      <v-container fluid class="pa-6">
        <!-- Page Header -->
        <v-row class="mb-4">
          <v-col cols="12">
            <h1 class="text-h4 font-weight-bold mb-2">User Management</h1>
            <p class="text-body-1 text-grey-darken-1">
              Manage system users, review and approve new registrations
            </p>
          </v-col>
        </v-row>

        <!-- Tabs Navigation -->
        <v-row>
          <v-col cols="12">
            <v-tabs v-model="activeTab" color="primary" class="mb-4">
              <v-tab value="pending">
                <v-icon start>mdi-account-clock</v-icon>
                Pending Approvals
                <v-badge
                  v-if="pendingCount > 0"
                  :content="pendingCount"
                  color="warning"
                  inline
                  class="ml-2"
                />
              </v-tab>
              <v-tab value="users">
                <v-icon start>mdi-account-group</v-icon>
                All Users
              </v-tab>
            </v-tabs>

            <v-tabs-window v-model="activeTab">
              <v-tabs-window-item value="pending">
                <PendingUsersTable />
              </v-tabs-window-item>
              <v-tabs-window-item value="users">
                <UserManagementTable />
              </v-tabs-window-item>
            </v-tabs-window>
          </v-col>
        </v-row>
      </v-container>
    </template>
  </InnerLayoutWrapper>
</template>
