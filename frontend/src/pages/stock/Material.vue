<template>
  <div class="p-4">
    <header class="sticky top-0 z-10 flex items-center justify-between border-b bg-white shadow-sm px-4 py-3">
      <!-- Breadcrumbs for Material List -->
      <div class="flex space-x-2 justify-end">
        <!-- Button to navigate to Material Request update page -->
        <router-link
          :to="{
            name: 'Material Request',
            params: {
              courseName: 'new',
            },
          }"
        >
          <Button variant="solid" class="bg-black-600 text-white hover:bg-black-700">
            <template #prefix>
              <Plus class="h-4 w-4" />
            </template>
            {{ __('Material Request') }}
          </Button>
        </router-link>
      </div>
    </header>

    <!-- Display Material Request Series Numbers -->
    <div class="mt-4">
      <div class="flex flex-col space-y-4">  
        <div
          v-for="(request, index) in materialRequests"
          :key="request.name"
          class="border p-4 rounded-md bg-gray-100 shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
          @click="openModal(request)"
        >
          <span class="font-semibold text-lg text-left">{{ request.name }}</span>  
        </div>
      </div>
    </div>

    <!-- Modal for Material Request Form -->
    <div v-if="isModalOpen" class="fixed inset-0 flex justify-center items-center bg-gray-900 bg-opacity-50 z-20">
      <div class="bg-white p-6 rounded-md shadow-lg max-w-lg w-full">
        <MaterialRequestForm :requirement="selectedRequest" @close="closeModal" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { Button } from 'frappe-ui';
import { Plus } from 'lucide-vue-next';
import MaterialRequestForm from './MaterialRequestForm.vue';  // Import the MaterialRequestForm component

// Declare reactive variables
const materialRequests = ref([]);
const isModalOpen = ref(false);
const selectedRequest = ref(null);

// Fetch Material Request series numbers
const fetchMaterialRequestSeries = async () => {
  try {
    const response = await axios.get('/api/resource/Material Request', {
      params: { limit: 100 },
    });

    if (Array.isArray(response.data.data)) {
      materialRequests.value = response.data.data;
    }
  } catch (error) {
    console.error('Error fetching material requests:', error.message || 'Unknown error');
  }
};

// Fetch full details of the selected Material Request
const fetchDetails = async (seriesNumber) => {
  try {
    const response = await axios.get(`/api/resource/Material Request/${seriesNumber}`);
    selectedRequest.value = response.data.data || {};
    isModalOpen.value = true;
  } catch (error) {
    console.error('Error fetching details:', error.message || 'Unknown error');
  }
};

// Open the modal and fetch details of the selected request
const openModal = async (request) => {
  if (request) {
    await fetchDetails(request.name);  // Fetch full details for the clicked Material Request
  } else {
    console.error('Request is null or undefined');
  }
};

// Close the modal
const closeModal = () => {
  isModalOpen.value = false;
  selectedRequest.value = null;
};

// Fetch the Material Request series numbers when the component is mounted
onMounted(() => {
  fetchMaterialRequestSeries();
});
</script>

<style scoped>
/* Custom styles for the modal */
</style>