<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <v-card class="w-100" style="max-width: 560px">
      <v-card-title class="text-h5 text-center py-6">Approval Pending</v-card-title>

      <v-card-text class="px-6 pb-6">
        <p class="text-body-1 mb-4">
          Your account was created successfully.
        </p>
        <p class="text-body-1 mb-6">
          Please wait for an administrator to approve your access. You’ll be able to sign in and use the system once approved.
        </p>

        <v-alert type="info" variant="tonal" class="mb-6">
          If you think this is taking too long, contact your administrator.
        </v-alert>

        <v-btn block color="primary" variant="elevated" class="text-none" @click="goToLogin">
          Back to login
        </v-btn>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { useAuthUserStore } from "@/stores/authUser";

const authStore = useAuthUserStore();

async function goToLogin() {
  await authStore.signOut("/auth?mode=login");
}
</script>
