<template>
	<div>
	  <header class="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-3 py-2.5 sm:px-5">
		<div class="flex items-center space-x-2">
		  <!-- Back Button -->
		  <router-link to="/" class="text-blue-600 hover:text-blue-800">
			<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
			</svg>
		  </router-link>
		  
		</div>
  
		<div class="flex space-x-2 justify-end">
  <router-link :to="{ name: 'CreateRequirement', params: { courseName: 'new' } }" class="inline-block">
    <button class="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
      <Plus class="h-4 w-4 mr-1" />
      {{ __('Add Requirement') }}
    </button>
  </router-link>
</div>

	  </header>
  
	  <div class="mt-4">
		<div v-if="!seriesNumbers.length" class="text-center text-gray-500">
		  {{ __('No requirements found.') }}
		</div>
		<div v-else>
		  <div
			v-for="series in seriesNumbers"
			:key="series.name"
			class="bg-white shadow-lg rounded-lg p-4 mb-4 border border-gray-200 cursor-pointer"
			@click="series.custom_document_status === 'Released' ? fetchDetails(series.name) : null"
		  >
			<h2 class="text-xl font-semibold mb-2">{{ series.name }}</h2>
			<p class="text-gray-600 mb-2">
			  Status:
			  <span
				:class="{
				  'text-red-600': series.custom_document_status === 'Locked',
				  'text-green-600': series.custom_document_status === 'Released',
				  'text-gray-600': !series.custom_document_status,
				}"
			  >
				{{ series.custom_document_status || 'Unknown Status' }}
			  </span>
			</p>
			<p class="text-gray-600 mb-2">
			  Required By: <span>{{ formatDate(series.schedule_date) }}</span>
			</p>
		  </div>
		</div>
	  </div>
  
	  <!-- Modal for Requirement Details -->
	  <ModalWrapper :isOpen="isModalOpen" title="Requirement Details" @close="isModalOpen = false">
		<RequirementForm :requirement="selectedRequirement" @update="handleUpdate" @close="isModalOpen = false" />
	  </ModalWrapper>
  
	  <!-- Modal for Adding New Requirement -->
	  <ModalWrapper :isOpen="isAddRequirementModalOpen" title="Add New Requirement" @close="closeAddRequirementModal">
		<RequirementForm :requirement="newRequirement" @update="handleAddRequirement" @close="closeAddRequirementModal" />
	  </ModalWrapper>
	</div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import axios from 'axios';
  import ModalWrapper from '@/components/Modals/ModalWrapper.vue';
  import RequirementForm from './RequirementForm.vue';
  
  const seriesNumbers = ref([]);
  const selectedRequirement = ref(null);
  const newRequirement = ref({});
  const isModalOpen = ref(false);
  const isAddRequirementModalOpen = ref(false);
  
  
  // Fetch all series numbers using API call
const fetchMaterialRequirmentList = async () => {
  try {
    const response = await axios.get('/api/resource/Material Requirement', {
      params: { limit: 100 },
    });

    if (Array.isArray(response.data.data)) {
      seriesNumbers.value = response.data.data;
      // Fetch details for each series in parallel
      await Promise.all(seriesNumbers.value.map(series => fetchMaterialRequirmentDetails(series)));
    }
  } catch (error) {
    console.error('Error fetching series numbers:', error.message || 'Unknown error');
  }
};

// Fetch details for each series
const fetchMaterialRequirmentDetails = async (series) => {
  try {
    const response = await axios.get(`/api/resource/Material Requirement/${series.name}`);
    const seriesDetails = response.data.data;
    // Immediately update the properties you need
    series.schedule_date = seriesDetails.schedule_date;
    series.custom_document_status = seriesDetails.custom_document_status;
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
	  console.error('Error fetching details:', error.message || 'Unknown error');
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
	  fetchMaterialRequirmentList(); 
	  isAddRequirementModalOpen.value = false; 
	} catch (error) {
	  console.error('Error adding requirement:', error.response?.data?.message || error.message || 'Unknown error');
	}
  };
  
  // Open modal for adding new requirement
  const openAddRequirementModal = () => {
	newRequirement.value = {};
	isAddRequirementModalOpen.value = true;
  };
  
  // Close the add requirement modal
  const closeAddRequirementModal = () => {
	isAddRequirementModalOpen.value = false;
  };
  
  // Format date for display
  const formatDate = (dateString) => {
	if (!dateString) return 'N/A';
	const date = new Date(dateString);
	return date.toLocaleDateString(); 
  };
  
  onMounted(() => {
	fetchMaterialRequirmentList();
  });
  </script>
  
  <style scoped>
  /* Add styles for the main component if needed */
  </style>