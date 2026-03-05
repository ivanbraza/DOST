<template>
  <v-footer
    v-if="config?.showFooter && footerConfig"
    app
    class="text-white"
    :color="footerConfig.color"
  >
    <v-container>
      <v-row align="center" justify="space-between">
        <v-col cols="12" md="6">
          <div class="d-flex align-center">
            <v-icon class="me-2" :icon="footerConfig.icon" size="large" />
            <div>
              <div class="text-h6 font-weight-bold">
                {{ footerConfig.companyName }}
              </div>
              <div class="text-caption">
                {{ footerConfig.tagline }}
              </div>
            </div>
          </div>
        </v-col>

        <v-col class="text-md-end text-center" cols="12" md="6">
          <div class="mb-2">
            <v-btn
              v-for="social in footerConfig.socialLinks"
              :key="social.platform"
              :aria-label="social.label"
              class="me-2"
              color="on-primary"
              icon
              variant="text"
              @click="openLink(social.url)"
            >
              <v-icon :icon="social.icon" />
            </v-btn>
          </div>

          <div class="text-caption">
            {{ currentYear }} © {{ footerConfig.copyright }}
          </div>
        </v-col>
      </v-row>
      <!-- Thesis Team Section -->
      <template v-if="footerConfig.thesisTeam?.enabled">
        <v-divider class="my-4 " />

        <v-row>
          <v-col cols="12">
            <div class="text-center mb-4">
              <div class="text-h6 font-weight-bold">
                {{ footerConfig.thesisTeam.title }}
              </div>
              <div class="text-caption text-grey-lighten-1">
                {{ footerConfig.thesisTeam.subtitle }}
              </div>
            </div>

            <v-row justify="center">
              <v-col
                v-for="member in footerConfig.thesisTeam.members"
                :key="member.name"
                cols="12"
                sm="6"
                md="3"
                class="d-flex justify-center"
              >
                <div class="d-flex align-center mb-3">
                  <v-avatar
                    :image="member.avatar"
                    size="48"
                    class="me-3"
                    color="primary"
                  >
                    <v-icon
                      v-if="!member.avatar"
                      icon="mdi-account"
                      size="24"
                    />
                  </v-avatar>

                  <div class="flex-grow-1">
                    <div class="text-body-2 font-weight-bold">
                      {{ member.name }}
                    </div>
                    <div class="text-caption text-grey-lighten-1">
                      {{ member.role }}
                    </div>
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </template>
      <v-divider class="my-4" />

     
    </v-container>
  </v-footer>
</template>

<script lang="ts" setup>
import type { UIConfig } from "@/controller/landingController";
import { useRouter } from "vue-router";
import { computed } from "vue";

interface Props {
  config?: UIConfig | null;
}

const props = defineProps<Props>();
const router = useRouter();

const hiddenFooterPaths = [
  "/account/home",
  "/account/repository",   
  "/admin/document-approvals",
  "/admin/user-roles",
  "/admin/user-management",
];

const normalizePath = (p: string) =>
  (p || "/").toLowerCase().replace(/\/+$/, "") || "/";

// keep template condition unchanged; control visibility here
const footerConfig = computed(() => {
  const base = props.config?.footer;
  if (!base) return null;

  const current = normalizePath(router.currentRoute.value.path);
  const isHidden = hiddenFooterPaths.some((p) => {
    const path = normalizePath(p);
    return current === path || current.startsWith(path + "/");
  });

  return isHidden ? null : base;
});

const currentYear = computed(() => new Date().getFullYear());

function openLink(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}
</script>