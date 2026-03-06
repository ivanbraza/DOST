<script setup lang="ts">
import { ref } from 'vue'
import { useFileSubmit } from '@/composables/fileSubmit'
import './css/fileSubmit.css'

// File input ref
const fileInputRef = ref<HTMLInputElement | null>(null)

// Use the composable
const {
  isDragging,
  selectedFile,
  isProcessing,
  ocrResult,
  previewUrl,
  fileType,
  showSubmitDialog,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleFileInput,
  clearSelection,
  copyToClipboard,
  openSubmitDialog,
  closeSubmitDialog,
} = useFileSubmit()

// Toggle state for showing results
const showResults = ref(false)

// Full-size image viewer dialog
const showFullSizeDialog = ref(false)

// Thank you dialog state
const showThankYouDialog = ref(false)

// Toggle results visibility
const toggleResults = () => {
  showResults.value = !showResults.value
}

// Open full-size image viewer
const openFullSizeViewer = () => {
  showFullSizeDialog.value = true
}

// Handle successful submission - reset everything
const handleSubmitSuccess = () => {
  clearSelection()
  showResults.value = false
  showFullSizeDialog.value = false

  // Reset the file input element
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }

  // Show thank you dialog after clearing
  showThankYouDialog.value = true
}

//item for pie chart
 const items = [
  { key: 1, title: 'Draft', value: 5, color: '#9CA3AF' },
  { key: 2, title: 'Approved', value: 10, color: '#3B82F6' },
  { key: 3, title: 'Ongoing', value: 15, color: '#F59E0B' },
  { key: 4, title: 'Completed', value: 5, color: '#10B981' },
 ]


const projects = ref([
  {
    name: "SMARTER AGUSAN: Agusan del Norte's Development thru Value-Addition...",
    progress: 48,
    color: "blue-darken-2"
  },
  {
    name: "Smart Aquaculture Monitoring System Using IoT for Tilapia Production",
    progress: 66,
    color: "green"
  },
  {
    name: "Development of Climate-Resilient Rice Varieties for Coastal Lowland Areas",
    progress: 75,
    color: "orange"
  },
  {
    name: "Production of Rice Varieties for Coastal Lowland Areas",
    progress: 50,
    color: "yellow"
  }
])
</script>

<template>


  <!-- Header Section -->
   <v-card class="dashboard-card mb-5" rounded="xl" color="#1A2CA3">
    <v-row class="pa-4" align="center">
      <!-- Text: full width on xs, 10/12 on md+ -->
      <v-col cols="12" md="10">
        <p class="text-h7 font-weight-small ml-2 mb-2">March 03, 2026</p>
        <h4 class="text-h4 font-weight-bold ml-2">Good Day, Mark</h4>
      </v-col>

      <!-- Button: full width below text on xs, right on md+ -->
      <v-col cols="12" md="2" class="d-flex justify-center justify-md-end mt-3 mt-md-0">
        <v-btn class="pa-3" rounded="xl" size="large" color="white" block>
          <v-icon icon="mdi-plus-thick" start></v-icon>
          New Project
        </v-btn>
      </v-col>

    </v-row>
  </v-card>



<v-row>
  <v-col cols="12" md="3">
    <v-card class="signatory-card" rounded="xl" elevation="0">
  <v-card-text class="d-flex align-center justify-space-between px-4 py-3">
    <v-icon icon="mdi-folder-outline" color="#c07a2b" size="70px" />

    <div class="text-left flex-grow-1 ml-3">
      <div class="text-center text-h6 text-grey-darken-1">Projects</div>
      <div class="text-center text-h4 font-weight-bold text-black">1</div>
    </div>
  </v-card-text>
</v-card>
  </v-col>

  <v-col cols="12" md="3">
    <v-card class="signatory-card" rounded="xl" elevation="0">
  <v-card-text class="d-flex align-center justify-space-between px-4 py-3">
    <v-icon icon="mdi-folder-check-outline" color="green" size="70px" />

    <div class="text-left flex-grow-1 ml-3">
      <div class="text-center text-h6 text-grey-darken-1">Signatory Projects</div>
      <div class="text-center text-h4 font-weight-bold text-black">444</div>
    </div>
  </v-card-text>
</v-card>
  </v-col>

  <v-col cols="12" md="3">
    <v-card class="signatory-card" rounded="xl" elevation="0">
  <v-card-text class="d-flex align-center justify-space-between px-4 py-3">
    <v-icon icon="mdi-alert-circle-outline" color="yellow" size="70px" />

    <div class="text-left flex-grow-1 ml-3">
      <div class="text-center text-h6 text-grey-darken-1">Needs Review</div>
      <div class="text-center text-h4 font-weight-bold text-black">9</div>
    </div>
  </v-card-text>
</v-card>
  </v-col>

   <v-col cols="12" md="3">
    <v-card class="signatory-card" rounded="xl" elevation="0">
  <v-card-text class="d-flex align-center justify-space-between px-4 py-3">
    <v-icon icon="mdi-close-octagon" color="red" size="70px" />

    <div class="text-left flex-grow-1 ml-3">
      <div class="text-center text-h6 text-grey-darken-1">Urgent Task</div>
      <div class="text-center text-h4 font-weight-bold text-black">6</div>
    </div>
  </v-card-text>
</v-card>
  </v-col>
</v-row>

<v-row>

  <v-col>
      <v-card cols="12" class="proj-status" rounded="xl">
          <div class="d-flex align-center px-4 pt-3">
            <v-icon icon="mdi-chart-arc" color="black" size="50px"></v-icon>
            <div class="text-h5 font-weight-bold text-black ml-3">Project Status Chart</div>
          </div>
          <div class="d-flex justify-center py-3">
            <v-pie
              :items="items"
              :legend="{ textFormat: '[title] ([value])' }"
              :tooltip="{ subtitleFormat: '[value]' }"
              gap="0"
              hover-scale="0"
              inner-cut="60"
              size="300"
              animation
              hide-slice
            />
          </div>
             </v-card>
    </v-col>


  <v-col cols="12" md="6">
    <v-card class="proj-progress pa-4" rounded="xl">

      <!-- Header -->
      <div class="d-flex align-center mb-4">
        <v-icon icon="mdi-poll" color="white" size="32" class="mr-2"/>
        <div class="text-h6 font-weight-bold text-white">
          Project Progress
        </div>
      </div>

      <!-- Project List -->
      <v-sheet
        v-for="project in projects"
        :key="project.name"
        class="pa-3 mb-3"
        rounded="lg"
        color="white"
      >
        <div class="text-body-2 font-weight-medium mb-2">
          {{ project.name }}
        </div>

        <div class="d-flex align-center">
          <v-progress-linear
            :model-value="project.progress"
            :color="project.color"
            height="15"
            rounded
            class="flex-grow-1 mr-2 progress-bar"
          />

          <span class="text-h6"> {{ project.progress }}%</span>
        </div>
      </v-sheet>

    </v-card>
  </v-col>


</v-row>
    
  


  <!-- <v-card class="file-submit-card" elevation="2">


    <v-card-text> -->
      <!-- 3Dropzone Area
      <div
        class="dropzone"
        :class="{ 'dropzone-active': isDragging, 'dropzone-disabled': isProcessing }"
        @dragover="handleDragOver"
        @dragleave="handleDragLeave"
        @drop="handleDrop"
      >
        <input
          ref="fileInputRef"
          type="file"
          id="file-input"
          class="file-input"
          accept="image/*,.pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          @change="handleFileInput"
          :disabled="isProcessing"
        />

        <label for="file-input" class="dropzone-label">
          <v-icon size="64" color="primary" class="mb-4">
            {{ isProcessing ? 'mdi-loading mdi-spin' : 'mdi-cloud-upload-outline' }}
          </v-icon>

          <div v-if="!selectedFile">
            <p class="text-h6 mb-2">Drop your file here</p>
            <p class="text-body-2 text-medium-emphasis">or click to browse</p>

            #Supported File Type Icons
            <div class="file-types-icons mt-4">
              <v-tooltip text="Images (JPG, PNG, BMP)" location="bottom">
                <template v-slot:activator="{ props }">
                  <div v-bind="props" class="file-type-icon">
                    <img
                      src="/assets/logos/image.png"
                      alt="Image files"
                      @error="(e) => ((e.target as HTMLImageElement).style.display = 'none')"
                    />
                    <v-icon size="40" color="blue" class="fallback-icon">mdi-image</v-icon>
                  </div>
                </template>
              </v-tooltip>

              <v-tooltip text="PDF Documents" location="bottom">
                <template v-slot:activator="{ props }">
                  <div v-bind="props" class="file-type-icon">
                    <img
                      src="/assets/logos/pdf.png"
                      alt="PDF files"
                      @error="(e) => ((e.target as HTMLImageElement).style.display = 'none')"
                    />
                    <v-icon size="40" color="red" class="fallback-icon">mdi-file-pdf-box</v-icon>
                  </div>
                </template>
              </v-tooltip>

              <v-tooltip text="Word Documents (DOCX)" location="bottom">
                <template v-slot:activator="{ props }">
                  <div v-bind="props" class="file-type-icon">
                    <img
                      src="/assets/logos/docx.png"
                      alt="Word documents"
                      @error="(e) => ((e.target as HTMLImageElement).style.display = 'none')"
                    />
                    <v-icon size="40" color="blue-darken-2" class="fallback-icon">mdi-file-word-box</v-icon>
                  </div>
                </template>
              </v-tooltip>
            </div>

            <p class="text-caption text-medium-emphasis mt-3">Supports: Images, PDF, DOCX</p>
          </div>

          <div v-else class="selected-file-info">
            <v-icon size="32" color="success" class="mb-2">mdi-check-circle</v-icon>
            <p class="text-body-1 font-weight-medium">{{ selectedFile.name }}</p>
            <p class="text-caption text-medium-emphasis">
              {{ (selectedFile.size / 1024).toFixed(2) }} KB
            </p>
          </div>
        </label>
      </div>

      #Processing Indicator
      <v-progress-linear
        v-if="isProcessing"
        indeterminate
        color="primary"
        class="mt-4"
      ></v-progress-linear>

      #Toggle Results Button and Submit File Button
      <div v-if="selectedFile && !isProcessing" class="mt-4 text-center d-flex justify-center gap-3">
        <v-btn
          color="primary"
          variant="tonal"
          @click="toggleResults"
          size="large"
					class="mx-2"
        >
          <v-icon left>{{ showResults ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
          {{ showResults ? 'Hide Results' : 'Show Results' }}
        </v-btn>

        <v-btn
          color="success"
          variant="elevated"
          @click="openSubmitDialog"
          size="large"
        >
          <v-icon left>mdi-file-upload</v-icon>
          Submit File
        </v-btn>
      </div>

      #Preview and Result Section
      <v-row v-if="selectedFile && showResults" class="mt-4">
        #File Preview 
        <v-col cols="12" :md="previewUrl ? 6 : 12">
          <v-card elevation="8" v-if="previewUrl" class="preview-card">
            <v-card-title class="text-subtitle-1 d-flex justify-space-between align-center">
              Image Preview
              <v-btn
                icon
                size="small"
                variant="text"
                @click="openFullSizeViewer"
              >
                <v-icon>mdi-fullscreen</v-icon>
              </v-btn>
            </v-card-title>
            <v-card-text class="preview-card-content">
              <v-img
                :src="previewUrl"
                max-height="300"
                contain
                class="rounded cursor-pointer"
                @click="openFullSizeViewer"
              ></v-img>
            </v-card-text>
          </v-card>

           #File Info for non-image files
          <v-card elevation="8" v-else class="preview-card">
            <v-card-title class="text-subtitle-1">File Information</v-card-title>
            <v-card-text class="preview-card-content">
              <v-list>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon>
                      {{ fileType === 'pdf' ? 'mdi-file-pdf-box' : 'mdi-file-word-box' }}
                    </v-icon>
                  </template>
                  <v-list-item-title>{{ selectedFile.name }}</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ (selectedFile.size / 1024).toFixed(2) }} KB • {{ fileType?.toUpperCase() }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>

        #Extracted Text Result
        <v-col cols="12" :md="previewUrl ? 6 : 12">
          <v-card elevation="8" class="preview-card">
            <v-card-title class="text-subtitle-1">
              {{ fileType === 'image' ? 'OCR Result' : 'Extracted Text' }}
            </v-card-title>
            <v-card-text class="preview-card-content">
              <v-textarea
                v-model="ocrResult"
                readonly
                rows="10"
                variant="outlined"
                placeholder="OCR text will appear here..."
                :loading="isProcessing"
              ></v-textarea>

              <v-btn
                v-if="ocrResult"
                color="primary"
                variant="outlined"
                size="small"
                @click="copyToClipboard"
              >
                <v-icon left size="small">mdi-content-copy</v-icon>
                Copy Text
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      #Action Buttons
      <v-row v-if="selectedFile && showResults" class="mt-2">
        <v-col>
          <v-btn
            color="error"
            variant="outlined"
            @click="clearSelection"
            :disabled="isProcessing"
          >
            <v-icon left>mdi-close</v-icon>
            Clear
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>

    #Full-Size Image Viewer Dialog
    <v-dialog
      v-model="showFullSizeDialog"
      max-width="90vw"
      max-height="90vh"
    >
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Full Size Image</span>
          <v-btn
            icon
            variant="text"
            @click="showFullSizeDialog = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="pa-0">
          <v-img
            v-if="previewUrl"
            :src="previewUrl"
            max-height="80vh"
            contain
          ></v-img>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            variant="text"
            @click="showFullSizeDialog = false"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    #Submit Dialog
    <SubmitDialog
      v-model="showSubmitDialog"
      :ocr-result="ocrResult"
      :selected-file="selectedFile"
      @close="closeSubmitDialog"
      @success="handleSubmitSuccess"
    />

    #Thank You Dialog
    <ThankYouDialog
      v-model="showThankYouDialog"
    />
  </v-card> -->




</template>
