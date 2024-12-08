<template>
  <div class="p-4">
    <header class="sticky top-0 z-10 flex items-center justify-between border-b bg-white shadow-sm px-4 py-3">
      <!-- Breadcrumbs for Material List -->
      <!-- <Breadcrumbs
        class="h-7"
        :items="[{ label: __('MaterialList'), route: { name: 'MaterialList' } }]"
      /> -->
      <div class="flex space-x-2 justify-end">
        <!-- Button to navigate to Material Request update page -->
        <router-link
          :to="{
            name: 'MaterialRequest',
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

    <!-- Filters -->
    <div class="mt-4 flex flex-wrap items-center justify-start gap-4">
      <!-- Filter by ID -->
      <div class="w-full sm:w-1/2">
        <label for="filter-id" class="block text-sm font-semibold mb-2">ID</label>
        <input
          id="filter-id"
          v-model="filters.name"
          type="text"
          placeholder="Enter ID"
          class="border px-3 py-2 rounded-md shadow-sm focus:ring focus:ring-blue-300 w-full"
          @input="onFilterChange"
        />
      </div>
      <!-- Required By Date -->
      <div class="w-full sm:w-1/2">
        <label for="filter-date" class="block text-sm font-semibold mb-2">Date</label>
        <input
          id="filter-date"
          v-model="filters.schedule_date"
          type="date"
          class="border px-3 py-2 rounded-md shadow-sm focus:ring focus:ring-blue-300 w-full"
          @change="onFilterChange"
        />
      </div>
    </div>

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
          <p class="text-sm text-gray-500 mt-1"><b>Required By: {{ formatDate(request.schedule_date) }}</b></p>
        </div>
      </div>
    </div>
        <div class="flex justify-center items-center mt-4">
      <div class="flex items-center space-x-2">
        <!-- Clickable boxes for items per page -->
        <button
          v-for="option in [20, 100, 500, 2500]"
          :key="option"
          :class="[ 
            'cursor-pointer px-3 py-1 bg-blue-100 rounded border border-gray-300 text-xs text-gray-800 hover:bg-blue-200 transition duration-200',
            itemsPerPage === option ? 'bg-gray-300 text-white' : ''
          ]"
          @click="itemsPerPage = option"
        >
          {{ option }}
        </button>
      </div>
    </div>

    <!-- Modal for Material Request Form -->
    <div v-if="isModalOpen" class="fixed inset-0 flex justify-center items-center bg-gray-900 bg-opacity-50 z-20">
      <div
        class="bg-white p-4 sm:p-6 rounded-md shadow-lg w-full"
        style="padding: 1cm; max-width: calc(100% - 2cm);"
      >
        <MaterialRequestForm :requirement="selectedRequest" @close="closeModal" />
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import { Button } from 'frappe-ui';
import { Plus } from 'lucide-vue-next';
import MaterialRequestForm from './MaterialRequestForm.vue'; // Import the MaterialRequestForm component

// Declare reactive variables
const materialRequests = ref([]);
const isModalOpen = ref(false);
const selectedRequest = ref(null);

const formatDate = (date) => {
  if (!date) return '';
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  const formattedDate = new Date(date).toLocaleDateString('en-GB', options);
  return formattedDate;
};
// Filters
const filters = ref({
  name: '',
  schedule_date: '',
});

// Pagination variables
const currentPage = ref(1);
const totalPages = ref(1);
const itemsPerPage = ref(20);
const loggedInUser = ref(null);


// Function to fetch the logged-in user
const getLoggedInUser = async () => {
  try {
    const response = await fetch('/api/method/tqerp_horticorp.tqerp_horticorp.utils.get_logged_user');
    const data = await response.json();

    if (data.message) {
      return data.message; // Return the logged-in user ID or email
    } else {
      console.error("Error fetching logged-in user");
      return null;
    }
  } catch (error) {
    console.error("Error fetching logged-in user:", error);
    return null;
  }
};

// Function to fetch material requests with logged-in user filter 
const fetchMaterialRequestSeries = async () => {
  try {
    // Get the logged-in user before making the API call
    const loggedInUser = await getLoggedInUser();

    if (!loggedInUser) {
      console.error("Logged-in user not found");
      return;
    }

    // Prepare query parameters for the Material Request API
    const params = {
      fields: '["name", "schedule_date", "owner"]',
      limit: itemsPerPage.value,
      page: currentPage.value,
      filters: JSON.stringify({
        owner: ['=', loggedInUser], // Filter material requests by logged-in user
      }),
    };

    if (filters.value.name) {
      params.filters = JSON.stringify({
        ...JSON.parse(params.filters), // Retain existing filters
        name: ['like', `%${filters.value.name}%`], // Add filter for name
      });
    }

    if (filters.value.schedule_date) {
      params.filters = JSON.stringify({
        ...JSON.parse(params.filters), // Retain existing filters
        schedule_date: ['=', filters.value.schedule_date], // Add filter for schedule date
      });
    }

    // Fetch the material request data from the API
    const response = await fetch(`/api/resource/Material Request?${new URLSearchParams(params)}`);
    const result = await response.json();

    if (Array.isArray(result.data)) {
      materialRequests.value = result.data;
      totalPages.value = Math.ceil(result.total / itemsPerPage.value); // Calculate total pages based on result's total count
    }
  } catch (error) {
    console.error('Error fetching material requests:', error.message || 'Unknown error');
  }
};


// Watch for filter changes and fetch data automatically
watch(filters, () => {
  currentPage.value = 1; // Reset to first page when filters change
  fetchMaterialRequestSeries();
});

// Watch for pagination changes and fetch data accordingly
watch([currentPage, itemsPerPage], () => {
  fetchMaterialRequestSeries();
});

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
    await fetchDetails(request.name); // Fetch full details for the clicked Material Request
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

// Change page for pagination
const changePage = (page) => {
  if (page > 0 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

// Trigger data refresh when filters are changed
const onFilterChange = () => {
  currentPage.value = 1;  // Reset pagination to page 1 when filter is applied
  fetchMaterialRequestSeries();
};
</script>