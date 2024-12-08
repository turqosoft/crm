<template>
	<div>
	  <!-- Header -->
	  <header class="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-3 py-2.5 sm:px-5">
  <div class="flex items-center space-x-2">
    <!-- Back Button -->
    <router-link to="/" class="text-black-600 hover:text-black-800">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    </router-link>
    <!-- <Breadcrumbs class="h-7" :items="[{ label: __('Requirements'), route: { name: 'Requirements' } }]"></Breadcrumbs> -->
  </div>

  <div class="flex space-x-2 justify-end">
    <router-link :to="{ name: 'CreateRequirement', params: { courseName: 'new' } }" class="inline-block">
      <button class="flex items-center px-4 py-2 bg-black text-white rounded hover:bg-gray-700">
        <Plus class="h-4 w-4 mr-1" />
        {{ __('Add Requirement') }}
      </button>
    </router-link>
  </div>
</header>


						<!-- Filter Section -->
			<div class="mt-4 px-3 sm:px-0">
			<div class="flex flex-wrap sm:flex-nowrap space-y-2 sm:space-y-0 sm:space-x-4">
				<!-- Filter by Status -->
				<div class="flex flex-col w-full sm:w-auto">
				<label for="status" class="text-sm font-semibold text-gray-800 mb-1">Status</label>
				<select
					v-model="filterStatus"
					id="status"
					class="border border-black rounded px-2 py-1 text-sm w-full sm:w-32 lg:w-40"
				>
					<option value="">All</option>
					<option value="Released">Released</option>
					<option value="Locked">Locked</option>
				</select>
				</div>

				<!-- Filter by ID -->
				<div class="flex flex-col w-full sm:w-auto">
				<label for="Id" class="text-sm font-semibold text-gray-800 mb-1">ID</label>
				<input
					v-model="filterName"
					type="text"
					id="Id"
					placeholder="Id"
					class="border border-black rounded px-2 py-1 text-sm w-full sm:w-32 lg:w-40"
				/>
				</div>

				<!-- Filter by Required By Date -->
				<div class="flex flex-col w-full sm:w-auto">
				<label for="requiredBy" class="text-sm font-semibold text-gray-800 mb-1">Required By</label>
				<input
					v-model="filterDate"
					type="date"
					id="requiredBy"
					class="border border-black rounded px-2 py-1 text-sm w-full sm:w-32 lg:w-40"
				/>
				</div>
			</div>
			</div>




  
	  <!-- Horizontal Line to separate filter and main content -->
	  <hr class="my-4 border-gray-300" />
  
	  <!-- Main Content -->
	  <div class="mt-4">
		<!-- No Series Found -->
		<div v-if="!currentSeries.length" class="text-center text-gray-500">
		  {{ __('No series numbers found') }}
		</div>
  
		<div class="p-4">
			<!-- Assuming you want to show the series only if currentSeries is not empty -->
			<div v-if="currentSeries.length > 0">
				<div
				v-for="series in currentSeries"
				:key="series.name"
				class="bg-white shadow-lg rounded-lg p-4 mb-4 border border-gray-200 cursor-pointer"
				@click="series.document_status === 'Released' ? fetchDetails(series.name) : null"
				>
				<h2 class="text-xl font-semibold mb-2">{{ series.name }}</h2>
				<p class="text-gray-600 mb-2">
					<b>Status:</b>
					<span
					:class="{
						'text-red-600 font-bold': series.document_status === 'Locked',
						'text-green-600 font-bold': series.document_status === 'Released',
						'text-gray-600 font-bold': !series.document_status,
					}"
					>
					{{ series.document_status || 'Unknown Status' }}
					</span>
				</p>
				<p class="text-gray-600 mb-2">
					<b>Required By:</b> <span><b>{{ formatDate(series.schedule_date) }}</b></span>
				</p>
				</div>
			</div>
			<!-- If there is no series available -->
			<div v-else>
				<p>No series available to display.</p>
			</div>
			</div>


		
<!-- Pagination Section -->
<section class="mt-4">
  <div class="flex flex-col sm:flex-row justify-start items-center space-y-2 sm:space-y-0">
    <!-- Left-aligned Pagination -->
    <div class="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2">
      <span class="flex items-center space-x-1 text-xs">
        <!-- <span>Page:</span>
        <select
          v-model="currentPage"
          @change="changePage(currentPage)"
          class="border rounded px-2 py-1 text-xs"
        >
          <option v-for="page in totalPages" :key="page" :value="page">{{ page }}</option>
        </select> -->
      </span>
      <span class="flex items-center space-x-1 text-xs">
        <span></span>
        <div class="flex space-x-1">
          <div
            v-for="num in [2500, 500, 100, 20]"
            :key="num"
            @click="changeItemsPerPage(num)"
            class="cursor-pointer px-3 py-1 bg-blue-100 rounded border border-gray-300 text-xs text-gray-800 hover:bg-blue-200"
          >
            {{ num }}
          </div>
        </div>
      </span>
    </div>

    <!-- Count Display -->
    <div class="text-xs text-gray-600 text-center sm:text-right w-full sm:w-auto">
      Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ filteredSeries.length }} results
    </div>
  </div>
</section>
</div>
  
	<ModalWrapper :isOpen="isModalOpen" title="Requirement Details" @close="isModalOpen = false">
		<div class="max-w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl w-full h-auto sm:h-96 md:h-104 lg:h-128 xl:h-144">
		<RequirementForm :requirement="selectedRequirement" @update="handleUpdate" @close="isModalOpen = false" />
		</div>
	</ModalWrapper>

	<!-- Modal for Adding New Requirement -->
	<ModalWrapper :isOpen="isAddRequirementModalOpen" title="Add New Requirement" @close="closeAddRequirementModal">
	<div class="max-w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl w-full h-auto sm:h-96 md:h-104 lg:h-128 xl:h-144">
		<RequirementForm :requirement="newRequirement" @update="handleAddRequirement" @close="closeAddRequirementModal" />
	</div>
	</ModalWrapper>

	</div>
  </template>
  
  <script setup>
  import { ref, onMounted, computed } from 'vue';
  import axios from 'axios';
  import ModalWrapper from '@/components/Modals/ModalWrapper.vue';
  import RequirementForm from './RequirementForm.vue';
  
  const seriesNumbers = ref([]);
  const selectedRequirement = ref(null);
  const newRequirement = ref({});
  const isModalOpen = ref(false);
  const isAddRequirementModalOpen = ref(false);
  
  const filterStatus = ref('');
  const filterName = ref('');
  const filterDate = ref('');
  const loggedInUser = ref(null);
  const currentPage = ref(1);
  const itemsPerPage = ref(20);
  
  // Get a slice of series numbers based on current page
  const currentSeries = computed(() => {
	const startIndex = (currentPage.value - 1) * itemsPerPage.value;
	const endIndex = startIndex + itemsPerPage.value;
	return filteredSeries.value.slice(startIndex, endIndex);
  });
  
  // Total number of pages based on items per page and the total number of series 
  const totalPages = computed(() => Math.ceil(filteredSeries.value.length / itemsPerPage.value));
  const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value);
  const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage.value, filteredSeries.value.length));
  
  const filteredSeries = computed(() => {
	return seriesNumbers.value.filter(series => {
	  const scheduleDate = series.schedule_date ? new Date(series.schedule_date) : null;
  
	  const matchesStatus = filterStatus.value ? series.document_status === filterStatus.value : true;
	  const matchesName = filterName.value ? series.name.toLowerCase().includes(filterName.value.toLowerCase()) : true;
	  const matchesDate = filterDate.value && scheduleDate
		? scheduleDate.toISOString().split('T')[0] === filterDate.value
		: !filterDate.value;
  
	  return matchesStatus && matchesName && matchesDate;
	});
  });
  
  const getLoggedInUser = async () => {
  try {
    // Fetch logged-in user from the backend method
    const response = await fetch('/api/method/tqerp_horticorp.tqerp_horticorp.utils.get_logged_user');
    const data = await response.json();

    if (data.message) {
      loggedInUser.value = data.message; // Update the state with the logged-in user's ID or email
      console.log("Logged-in user:", loggedInUser.value); // Print the logged-in user to the console
      return data.message;
    } else {
      console.error("Error fetching logged-in user");
      return null;
    }
  } catch (error) {
    console.error("Error fetching logged-in user:", error);
    return null;
  }
};

const fetchSeriesNumbers = async () => {
  try {
    // Ensure we have the logged-in user before fetching requirements
    if (!loggedInUser.value) {
      await getLoggedInUser();
    }

    if (!loggedInUser.value) {
      console.error("No logged-in user found. Unable to fetch requirements.");
      return;
    }

    // Fetch requirements belonging to the logged-in user
    const response = await axios.get('/api/resource/Material Requirement', {
      params: {
        filters: JSON.stringify([["owner", "=", loggedInUser.value]]),
        limit_page_length: 100
      }
    });

    if (Array.isArray(response.data.data)) {
      seriesNumbers.value = response.data.data.sort((a, b) => new Date(b.creation) - new Date(a.creation));
      await Promise.all(seriesNumbers.value.map(series => fetchSeriesDetails(series)));
    }
  } catch (error) {
    console.error('Error fetching series numbers:', error.message || 'Unknown error');
  }
};

  
  // Fetch details for each series
  const fetchSeriesDetails = async (series) => {
	try {
	  const response = await axios.get(`/api/resource/Material Requirement/${series.name}`);
	  const seriesDetails = response.data.data;
	  series.schedule_date = seriesDetails.schedule_date;
	  series.document_status = seriesDetails.document_status;
	} catch (error) {
	  console.error('Error fetching series details:', error.message || 'Unknown error');
	}
  };
  
  // Fetch individual series details on click
  const fetchDetails = async (seriesNumber) => {
	try {
	  const response = await axios.get(`/api/resource/Material Requirement/${seriesNumber}`);
	  selectedRequirement.value = response.data.data || {};
	  isModalOpen.value = true;
	} catch (error) {
	  console.error('Error fetching series details:', error.message || 'Unknown error');
	}
  };
  
  // Handle update from requirement form
  const handleUpdate = async (updatedRequirement) => {
	try {
	  await axios.put(`/api/resource/Material Requirement/${updatedRequirement.name}`, updatedRequirement);
	  const index = seriesNumbers.value.findIndex(series => series.name === updatedRequirement.name);
	  if (index !== -1) {
		seriesNumbers.value[index] = {
		  ...seriesNumbers.value[index],
		  ...updatedRequirement
		};
	  }
	  isModalOpen.value = false; // Close the modal after successful update
	} catch (error) {
	  console.error('Error updating requirement:', error.response?.data?.message || error.message || 'Unknown error');
	}
  };
  
  // Handle addition of new requirement
  const handleAddRequirement = async (newRequirement) => {
	try {
	  await axios.post('/api/resource/Material Requirement', newRequirement);
	  fetchSeriesNumbers(); 
	  isAddRequirementModalOpen.value = false; 
	} catch (error) {
	  console.error('Error adding requirement:', error.response?.data?.message || error.message || 'Unknown error');
	}
  };

  
  // Close Add Requirement Modal 
  const closeAddRequirementModal = () => {
	isAddRequirementModalOpen.value = false;
  };
  
  // Set Items per Page
  const changeItemsPerPage = (num) => {
	itemsPerPage.value = num;
	currentPage.value = 1;
  };
  
  // Change page
  const changePage = (page) => {
	currentPage.value = page;
  };
  
  // Format Date
  const formatDate = (date) => {
	return new Date(date).toLocaleDateString();
  };
  
  // Modal Trigger for Add Requirement
  const openAddRequirementModal = () => {
	isAddRequirementModalOpen.value = true;
  };
  
  onMounted(fetchSeriesNumbers);
  </script>
  
  <style scoped>
  /* Add scoped styles as needed */
  </style>