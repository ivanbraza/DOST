<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import InnerLayoutWrapper from '@/layouts/InnerLayoutWrapper.vue'

const route = useRoute()
const router = useRouter()

const projectId = computed(() => route.params.id as string)

const project = computed(() => ({
  title:
    "SMARTER AGUSAN: Agusan del Norte's Development thru Value-Addition, Networked Process Integration, and Technology Commercialization for Economic Advancement (ADVANCE)",
  program:
    'Community Empowerment thru Science and Technology & Smart and Sustainable Communities Program',
  overallProgress: 48,
  leader: 'Meriam B. Bouquia',
  agency: 'Provincial Science and Technology Office (PSTO) - Agusan del Norte',
  duration: '12 Months',
  startDate: 'January 1, 2025',
  endDate: 'December 31, 2025',
  totalCost: '₱ 7,611,270.00',
  psCost: '₱ 1,321,810.00',
  coCost: '₱ 4,900,000.00',
  grantTotal: '₱ 7,000,000.00',
  files: [
    {
      title: 'Proposal',
      description: 'Full research proposal document with background, objectives, and methodology.',
      status: 'Completed',
    },
    {
      title: 'Workplan',
      description: 'Full research proposal document with background, objectives, and methodology.',
      status: 'In Progress',
    },
  ],
}))

const goBack = () => {
  router.push('/account/repository')
}
</script>

<template>
  <InnerLayoutWrapper>
    <template #content>
      <v-container class="py-4">
        <!-- Back link -->
        <v-btn
          variant="text"
          color="primary"
          prepend-icon="mdi-arrow-left"
          class="mb-3 px-0"
          @click="goBack"
        >
          Back to Assigned Projects
        </v-btn>

        <!-- Header card -->
        <v-card class="mb-4" elevation="2">
          <v-card-text class="pa-5">
            <div class="d-flex justify-space-between align-start mb-2">
              <div>
                <div class="text-caption text-grey-darken-1 mb-1">
                  Project #{{ projectId }} · Draft
                </div>
                <div class="text-h6 font-weight-bold mb-2">
                  {{ project.title }}
                </div>
                <div class="text-body-2 text-grey-darken-1">
                  {{ project.program }}
                </div>
              </div>
            </div>

            <!-- Overall progress -->
            <div class="mt-4 mb-4">
              <div class="text-caption mb-1">Overall Progress</div>
              <v-progress-linear
                :model-value="project.overallProgress"
                height="8"
                color="primary"
                rounded
              />
            </div>

            <!-- Meta grid -->
            <v-row class="mt-2" dense>
              <v-col cols="12" md="3">
                <div class="meta-label">PROJECT LEADER</div>
                <div class="meta-value">{{ project.leader }}</div>
              </v-col>
              <v-col cols="12" md="3">
                <div class="meta-label">IMPLEMENTING AGENCY</div>
                <div class="meta-value">{{ project.agency }}</div>
              </v-col>
              <v-col cols="12" md="3">
                <div class="meta-label">PROJECT DURATION</div>
                <div class="meta-value">{{ project.duration }}</div>
              </v-col>
              <v-col cols="12" md="3">
                <div class="meta-label">PROJECT START DATE</div>
                <div class="meta-value">{{ project.startDate }}</div>
              </v-col>
              <v-col cols="12" md="3">
                <div class="meta-label">PROJECT END DATE</div>
                <div class="meta-value">{{ project.endDate }}</div>
              </v-col>
            </v-row>

            <!-- Totals row -->
            <v-row class="mt-4" dense>
              <v-col cols="12" md="3">
                <div class="meta-label">TOTAL PROJECT COST</div>
                <div class="meta-value">{{ project.totalCost }}</div>
              </v-col>
              <v-col cols="12" md="3">
                <div class="meta-label">PSTO COUNTERPART</div>
                <div class="meta-value">{{ project.psCost }}</div>
              </v-col>
              <v-col cols="12" md="3">
                <div class="meta-label">CO COUNTERPART</div>
                <div class="meta-value">{{ project.coCost }}</div>
              </v-col>
              <v-col cols="12" md="3">
                <div class="meta-label">GRAND TOTAL</div>
                <div class="meta-value primary-text">{{ project.grantTotal }}</div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Project files section -->
        <v-card elevation="2">
          <v-card-title class="d-flex justify-space-between align-center px-5 py-3">
            <div class="text-subtitle-1 font-weight-bold">Project Files</div>
            <div class="text-caption text-grey-darken-1">Completed · In Progress · Not Started</div>
          </v-card-title>
          <v-divider />
          <v-card-text class="pa-0">
            <v-list density="comfortable">
              <v-list-item
                v-for="file in project.files"
                :key="file.title"
                class="file-row"
              >
                <v-list-item-title class="d-flex justify-space-between align-center mb-1">
                  <div class="d-flex align-center ga-2">
                    <v-icon size="18">mdi-file-document-outline</v-icon>
                    <span class="font-weight-medium">{{ file.title }}</span>
                  </div>
                  <v-chip
                    size="small"
                    :color="file.status === 'Completed' ? 'success' : file.status === 'In Progress' ? 'warning' : 'grey'
                    "
                    variant="tonal"
                  >
                    {{ file.status }}
                  </v-chip>
                </v-list-item-title>
                <v-list-item-subtitle class="text-caption text-grey-darken-1">
                  {{ file.description }}
                </v-list-item-subtitle>
                <template #append>
                  <v-btn
                    color="primary"
                    variant="outlined"
                    size="small"
                    prepend-icon="mdi-eye"
                  >
                    View File
                  </v-btn>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-container>
    </template>
  </InnerLayoutWrapper>
</template>

<style scoped>
.meta-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #757575;
}

.meta-value {
  font-size: 13px;
  font-weight: 500;
  color: #212121;
}

.primary-text {
  color: #1a2ca3;
}

.file-row {
  border-top: 1px solid rgba(0, 0, 0, 0.04);
}
</style>
