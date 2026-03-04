<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <v-card class="w-100" style="max-width: 520px">
      <v-card-title class="text-h5 text-center py-6">Reset Password</v-card-title>

      <v-card-text class="px-6 pb-6">
        <v-alert
          v-if="!hasRecoverySession"
          type="warning"
          variant="tonal"
          class="mb-6"
        >
          Open the password reset link from your email to continue.
        </v-alert>

        <v-form
          ref="formRef"
          v-model="formValid"
          @submit.prevent="handleResetPassword"
        >
          <v-row no-gutters>
            <v-col cols="12">
              <v-text-field
                v-model="form.password"
                label="New Password"
                :type="showPassword ? 'text' : 'password'"
                variant="outlined"
                density="comfortable"
                :rules="[requiredValidator, passwordValidator]"
                :disabled="!hasRecoverySession"
                prepend-inner-icon="mdi-lock"
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="showPassword = !showPassword"
                class="mb-4"
              />
            </v-col>
          </v-row>

          <v-row no-gutters>
            <v-col cols="12">
              <v-text-field
                v-model="form.confirmPassword"
                label="Confirm New Password"
                :type="showConfirmPassword ? 'text' : 'password'"
                variant="outlined"
                density="comfortable"
                :rules="[
                  requiredValidator,
                  (v: string) => confirmedValidator(v, form.password),
                ]"
                :disabled="!hasRecoverySession"
                prepend-inner-icon="mdi-lock-check"
                :append-inner-icon="showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="showConfirmPassword = !showConfirmPassword"
                class="mb-6"
              />
            </v-col>
          </v-row>

          <v-row no-gutters>
            <v-col cols="12">
              <v-btn
                type="submit"
                color="primary"
                variant="elevated"
                size="large"
                block
                class="mb-2"
                :loading="loading"
                :disabled="!hasRecoverySession || !formValid || loading"
              >
                Update Password
              </v-btn>

              <v-btn
                block
                variant="text"
                class="text-none"
                @click="goToLogin"
              >
                Back to login
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import { supabase } from "@/lib/supabase";
import {
  requiredValidator,
  passwordValidator,
  confirmedValidator,
  getErrorMessage,
} from "@/lib/validator";

const router = useRouter();
const toast = useToast();

const formRef = ref();
const formValid = ref(false);
const loading = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);

const hasRecoverySession = ref(false);

const form = reactive({
  password: "",
  confirmPassword: "",
});

function goToLogin() {
  router.push({ path: "/auth", query: { mode: "login" } });
}

async function initRecoverySessionFromUrl() {
  const hash = window.location.hash;
  if (!hash || hash.length < 2) return;

  const params = new URLSearchParams(hash.slice(1));
  const type = params.get("type");
  const access_token = params.get("access_token");
  const refresh_token = params.get("refresh_token");

  if (type !== "recovery" || !access_token || !refresh_token) return;

  const { error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });

  if (error) {
    toast.error(getErrorMessage(error));
    return;
  }

  // Remove tokens from URL
  window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
}

onMounted(async () => {
  await initRecoverySessionFromUrl();

  const { data, error } = await supabase.auth.getSession();
  if (error) {
    toast.error(getErrorMessage(error));
    return;
  }

  hasRecoverySession.value = Boolean(data.session);
});

async function handleResetPassword() {
  if (!formValid.value) {
    toast.error("Please fill in all required fields correctly");
    return;
  }

  if (form.password !== form.confirmPassword) {
    toast.error("Passwords do not match");
    return;
  }

  loading.value = true;

  try {
    const { error } = await supabase.auth.updateUser({
      password: form.password,
    });

    if (error) {
      toast.error(getErrorMessage(error));
      return;
    }

    toast.success("Password updated successfully. Please sign in again.");
    await supabase.auth.signOut();
    goToLogin();
  } catch (err: any) {
    toast.error(err?.message || "An unexpected error occurred");
  } finally {
    loading.value = false;
  }
}
</script>
