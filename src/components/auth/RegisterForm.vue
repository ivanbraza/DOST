<template>
  <v-card-title class="text-h5 text-center py-6"> Create Account </v-card-title>

  <v-card-text class="px-6 pb-6 auth-form-content">
    <v-form ref="formRef" v-model="formValid" @submit.prevent="handleRegister">
      <v-container class="pa-0">
        <v-row no-gutters>
          <v-col cols="12">
            <v-text-field
              v-model="registerForm.fullName"
              label="Full Name"
              variant="outlined"
              density="comfortable"
              :rules="[requiredValidator, fullNameValidator]"
              :error-messages="errors.fullName"
              prepend-inner-icon="mdi-account"
              class="mb-4"
              hint="Enter your full name (e.g. Juan X. Dela Cruz)"
              persistent-hint
            />
          </v-col>
        </v-row>


        <!-- <v-row no-gutters>
          <v-col cols="12">
            <v-select
              v-model="registerForm.role"
              label="Role"
              variant="outlined"
              density="comfortable"
              :items="roleOptions"
              :rules="[requiredValidator]"
              :error-messages="errors.role"
              prepend-inner-icon="mdi-account-group"
              class="mb-4"
              hint="Select your role in the organization"
              persistent-hint
              :loading="rolesStore.loading"
              :disabled="rolesStore.loading"
            />
          </v-col>
        </v-row> -->

         <!-- Prefix and Suffix Field/Row  -->
        <v-row no-gutters  justify="space-between">
          <v-col cols="6" class="pr-1">
            <v-select
              v-model="registerForm.prefix"
              label="Prefix"
              variant="outlined"
              :items="['None', 'Dr', 'Engr', 'Atty']"
              density="comfortable"
              :rules="[requiredValidator]"
              :error-messages="errors.prefix"
              prepend-inner-icon="mdi-account-tie"
              class="mb-4"
            />
          </v-col>

          <v-col cols="6" class="pl-1">
            <v-select
              v-model="registerForm.suffix"
              label="Suffix"
              variant="outlined"
              :items="['None', 'PhD', 'Jr', 'Sr', 'II', 'III']"
              density="comfortable"
              :rules="[requiredValidator]"
              :error-messages="errors.suffix"
              prepend-inner-icon="mdi-card-account-details-outline"
              class="mb-4"
            />
          </v-col>
        </v-row>

         <v-row no-gutters>
          <v-col cols="12">
            <v-text-field
              v-model="registerForm.email"
              label="Email"
              type="email"
              variant="outlined"
              density="comfortable"
              :rules="[requiredValidator, emailValidator]"
              :error-messages="errors.email"
              prepend-inner-icon="mdi-email"
              class="mb-4"
              hint="Enter email address (Verification Code will be sent)"
              persistent-hint
            />
          </v-col>
        </v-row>

           <!-- Department and Position Field/Row  -->
        <v-row no-gutters  justify="space-between">
          <v-col cols="6" class="pr-1">
            <v-select
              v-model="registerForm.department"
              label="Department"
              variant="outlined"
              :items="['PSTO-Agusan del Norte', 'Technical Support Services', 'ORD', 'IT']"
              density="comfortable"
              :rules="[requiredValidator]"
              :error-messages="errors.department"
              prepend-inner-icon="mdi-office-building-marker-outline"
              class="mb-4"
            />
          </v-col>

          <v-col cols="6" class="pl-1">
            <v-select
              v-model="registerForm.position"
              label="Position"
              variant="outlined"
              :items="['Budget Officer', 'PSTD', 'Chief', 'PTA-1', 'Regional Director']"
              density="comfortable"
              :rules="[requiredValidator]"
              :error-messages="errors.position"
              prepend-inner-icon="mdi-map-marker-account-outline"
              class="mb-4"
            />
          </v-col>

        </v-row>

        <!-- Student Number Field - Only show if Student role is selected -->
        <!-- <v-row no-gutters v-if="isStudentRole">
          <v-col cols="12">
            <v-text-field
              v-model="registerForm.studentNumber"
              label="Student ID Number"
              variant="outlined"
              density="comfortable"
              :rules="[requiredValidator]"
              :error-messages="errors.studentNumber"
              prepend-inner-icon="mdi-school"
              class="mb-4"
              hint="Enter your student ID"
              persistent-hint
            />
          </v-col>
        </v-row> -->

        <v-row no-gutters>
          <v-col cols="12">
            <v-text-field
              v-model="registerForm.password"
              label="Password"
              :type="showPassword ? 'text' : 'password'"
              variant="outlined"
              density="comfortable"
              :rules="[requiredValidator, passwordValidator]"
              :error-messages="errors.password"
              prepend-inner-icon="mdi-lock"
              :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append-inner="showPassword = !showPassword"
              class="mb-4"
              hint="At least 8 characters with uppercase, lowercase, number, and special character (e.g. @, #, $, %)"
              persistent-hint
            />
          </v-col>
        </v-row>

        <v-row no-gutters>
          <v-col cols="12">
            <v-text-field
              v-model="registerForm.confirmPassword"
              label="Confirm Password"
              :type="showConfirmPassword ? 'text' : 'password'"
              variant="outlined"
              density="comfortable"
              :rules="[
                  requiredValidator,
                  (v: string) => confirmedValidator(v, registerForm.password)
                ]"
              :error-messages="errors.confirmPassword"
              prepend-inner-icon="mdi-lock-check"
              :append-inner-icon="
                showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'
              "
              @click:append-inner="showConfirmPassword = !showConfirmPassword"
              class="mb-6"
            />
          </v-col>
        </v-row>

        <v-row no-gutters>
          <v-col cols="12">
            <v-btn
              type="submit"
              color="on-primary"
              variant="elevated"
              size="large"
              block
              :loading="isLoading"
              :disabled="!formValid || isLoading"
              class="mb-4"
            >
              Create Account
            </v-btn>
          </v-col>
        </v-row>

        <v-row no-gutters>
          <v-col cols="12" class="text-center">
            <span class="text-body-2 text-high-emphasis">
              Already have an account?
            </span>
            <v-btn
              variant="text"
              color="light"
              size="small"
              class="ml-1"
              @click="$emit('switch-to-login')"
            >
              Sign In
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-form>
  </v-card-text>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import {
  requiredValidator,
  emailValidator,
  passwordValidator,
  confirmedValidator,
  fullNameValidator,
  getErrorMessage,
} from "@/lib/validator";
import { useAuthUserStore } from "@/stores/authUser";
import { useUserRolesStore } from "@/stores/roles";
import { useToast } from "vue-toastification";
import { useRouter } from "vue-router";
import { de } from "vuetify/locale";

// Emits
const emit = defineEmits<{
  "switch-to-login": [];
}>();

// Composables
const authStore = useAuthUserStore();
const rolesStore = useUserRolesStore();
const toast = useToast();
const router = useRouter();

// Form refs and reactive data
const formRef = ref();
const formValid = ref(false);
const loading = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);

// Computed
const isLoading = computed(() => loading.value || authStore.loading);

// Form data
const registerForm = reactive({
  fullName: "",
  email: "",
  prefix: undefined as string | undefined,
  suffix: undefined as string | undefined,
  department: undefined as string | undefined,
  position: undefined as string | undefined,
  role: undefined as number | undefined,
  password: "",
  confirmPassword: "",
});

// Computed properties for role options (change to positionOptions soon)
const roleOptions = computed(() => {
  return rolesStore.roles.map(role => ({
    title: role.title || 'Untitled Role',
    value: role.id
  }));
});


// Error handling
const errors = reactive({
  fullName: "",
  email: "",
  prefix: "",
  suffix: "",
  department: "",
  position: "",
  role: "",
  password: "",
  confirmPassword: "",
});

// Methods
const clearErrors = () => {
  errors.fullName = "";
  errors.email = "";
  errors.prefix = "";
  errors.suffix = "";
  errors.department = "";
  errors.position = "";
  errors.password = "";
  errors.confirmPassword = "";
  errors.role = "";
};

const handleRegister = async () => {
  if (!formValid.value) {
    toast.error("Please fill in all required fields correctly");
    return;
  }

  if (registerForm.password !== registerForm.confirmPassword) {
    toast.error("Passwords do not match");
    return;
  }

  loading.value = true;
  clearErrors();

  try {
    const result = await authStore.registerUser(
      registerForm.email,
      registerForm.password,
      registerForm.fullName,
      undefined, // Role will be assigned by admin
      registerForm.prefix,
      registerForm.suffix,
      registerForm.department,
      registerForm.position
    );

    if (result.error) {
      const errorMessage = getErrorMessage(result.error);
      toast.error(errorMessage || "Registration failed");

      // Handle specific error types
      if (errorMessage.toLowerCase().includes("email")) {
        errors.email = errorMessage;
      } else if (errorMessage.toLowerCase().includes("fullname")) {
        errors.fullName = errorMessage;
      } else if (errorMessage.toLowerCase().includes("password")) {
        errors.password = errorMessage;
      } //else if (errorMessage.toLowerCase().includes("role")) {
      //   errors.role = errorMessage;
      // }
    } else {
      toast.success(
        "Account created successfully! Please check your email to verify your account."
      );
      resetForm();
      // Switch back to login form after successful registration
      emit('switch-to-login');
        router.push({ path: "/pending-approval" });
    }
  } catch (error: any) {
    toast.error(error.message || "An unexpected error occurred");
  } finally {
    loading.value = false;
  }
};

// Reset form
const resetForm = () => {
  registerForm.fullName = "";
  registerForm.email = "";
  registerForm.prefix = undefined;
  registerForm.suffix = undefined;
  registerForm.department = undefined;
  registerForm.position = undefined;
  registerForm.password = "";
  registerForm.confirmPassword = "";
  registerForm.role = undefined as number | undefined;
  clearErrors();
  formRef.value?.resetValidation();
};

// Load roles on component mount
onMounted(async () => {
  await rolesStore.fetchRoles();
  
});

// Expose methods for parent component
defineExpose({
  resetForm,
});
</script>

<style scoped>
.auth-form-content {
  width: 100%;
  box-sizing: border-box;
}
</style>
