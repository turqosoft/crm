<template>
	<div class="p-4">
	  <header class="sticky top-0 z-10 flex items-center justify-between border-b bg-white shadow-sm px-4 py-3">
		<Breadcrumbs
		  class="h-7"
		  :items="[{ label: __('Stock'), route: { name: 'Stock' } }]"
		/>
		<div class="flex space-x-2 justify-end">
		  <router-link
			:to="{
			  name: 'CreateStock',
			  params: { courseName: 'new' },
			}"
		  >
			<Button variant="solid" class="bg-black-600 text-white hover:bg-black-700">
			  <template #prefix>
				<Plus class="h-4 w-4" />
			  </template>
			  {{ __('Update Stock') }}
			</Button>
		  </router-link>
		</div>
	  </header>
  
	  <div class="mt-4">
		<!-- Filter Controls -->
		<div class="mb-4 flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
			<input
				v-model="filters.id"
				type="text"
				placeholder="ID"
				class="border border-gray-300 rounded px-4 py-2 w-full sm:w-auto"
			/>
			<input
				v-model="filters.posting_date"
				type="date"
				placeholder="Filter by Posting Date"
				class="border border-gray-300 rounded px-4 py-2 w-full sm:w-auto"
			/>
		</div>

  
		<!-- Display filtered stock reconciliation series numbers -->
		<div v-if="paginatedSeriesNumbers.length">
		  <ul class="space-y-4">
			<li
			  v-for="series in paginatedSeriesNumbers"
			  :key="series.name"
			  class="p-4 border border-gray-200 rounded-lg bg-gray-50 shadow-sm cursor-pointer hover:bg-gray-100 transition duration-200"
			  @click="fetchStockDetails(series.name)"
			>
			  <p class="text-lg font-semibold text-gray-800"><b>{{ series.name }}</b></p>
			  <p class="text-gray-600"><b>Posting Date:{{ formatDate(series.posting_date) }}</b></p>
			</li>
		  </ul>
		</div>
		<div v-else>
		  <p class="text-gray-500">No series found matching the filters.</p>
		</div>
  
		
			<div class="p-4">
				<!-- Pagination Controls -->
				<div class="flex justify-center items-center mt-4">
				<div class="flex items-center space-x-2">
					<!-- Clickable boxes for items per page -->
					<button
					v-for="option in [20, 100, 500, 2500]"
					:key="option"
					:class="[ 
						'cursor-pointer px-3 py-1 bg-blue-100 rounded border border-gray-300 text-xs text-gray-800 hover:bg-blue-200 transition duration-200',
						itemsPerPage === option ? 'bg-gray-300 text-white' : 'bg-gray-100'
					]"
					@click="itemsPerPage = option"
					>
					{{ option }}
					</button>
				</div>
				</div>
			</div>


		<!-- Modal for Stock Details -->
		<transition name="fade">
		  <div
			v-if="isModalOpen"
			class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
		  >
			<div class="bg-white rounded-lg overflow-hidden shadow-lg w-full max-w-lg p-6">
			  <h2 class="text-xl font-bold mb-4">Stock Details</h2>
			  <StockForm
				v-if="selectedStock"
				:stock="selectedStock"
				@submit="handleStockSubmit"
				@update="updateSeriesPostingDate"
				@close="closeModal"
			  />
			</div>
		  </div>
		</transition>
	  </div>
	</div>
  </template>
  
  
  <script setup>
  import { ref, computed, onMounted } from 'vue';
  import { Breadcrumbs, Button } from 'frappe-ui';
  import { Plus } from 'lucide-vue-next';
  import StockForm from './StockForm.vue';
  
  // Define reactive state for series numbers, pagination, and modal
  const seriesNumbers = ref([]);
  const selectedStock = ref(null);
  const isModalOpen = ref(false);
  const filters = ref({
	id: '',
	posting_date: '',
  });
  const currentPage = ref(1);
  const itemsPerPage = ref(20);  // Default items per page
  const totalItems = ref(0);
  const loggedInUser = ref(null);
  
  const formatDate = (date) => {
  if (!date) return '';
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  const formattedDate = new Date(date).toLocaleDateString('en-GB', options); // 'en-GB' gives the dd-mm-yyyy format
  return formattedDate;
};

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
  let allSeries = [];
  let page = 1;
  const pageSize = 100;
  
  // Get the logged-in user
  const loggedInUser = await getLoggedInUser();

  if (!loggedInUser) {
    console.error('Logged-in user not found');
    return;
  }

  // Fetch stock reconciliations only for the logged-in user
  while (true) {
    try {
      const response = await fetch(`/api/resource/Stock Reconciliation?fields=["name", "posting_date", "owner"]&limit=${pageSize}&page=${page}&filters={"owner": "${loggedInUser}"}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.data) {
        allSeries = allSeries.concat(
          data.data.map(stock => ({
            name: stock.name,
            posting_date: stock.posting_date || 'N/A',
          }))
        );
      }

      if (data.data.length < pageSize) {
        break;
      }

      page++;
    } catch (error) {
      console.error('Error fetching series numbers:', error);
      break;
    }
  }

  totalItems.value = allSeries.length;
  seriesNumbers.value = allSeries;
};

  
  // Filtered series numbers based on user input
  const filteredSeriesNumbers = computed(() => {
	const idFilter = filters.value.id ? filters.value.id.toLowerCase() : '';
	const dateFilter = filters.value.posting_date;
  
	return seriesNumbers.value.filter(series => {
	  const matchesId = idFilter ? series.name.toLowerCase().includes(idFilter) : true;
	  const matchesPostingDate = dateFilter ? series.posting_date === dateFilter : true;
  
	  return matchesId && matchesPostingDate;
	});
  });
  
  // Paginated series numbers
  const paginatedSeriesNumbers = computed(() => {
	const start = (currentPage.value - 1) * itemsPerPage.value;
	const end = start + itemsPerPage.value;
	return filteredSeriesNumbers.value.slice(start, end);
  });
  
  // Total number of pages
  const totalPages = computed(() => Math.ceil(filteredSeriesNumbers.value.length / itemsPerPage.value));

  // Function to fetch stock details based on the selected series number
  const fetchStockDetails = async (seriesNumber) => {
	try {
	  const response = await fetch(`/api/resource/Stock Reconciliation/${seriesNumber}`, {
		method: 'GET',
		headers: {
		  'Accept': 'application/json',
		  'Content-Type': 'application/json',
		}
	  });
  
	  if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	  }
  
	  const stockDetails = await response.json();
	  selectedStock.value = stockDetails.data;
	  isModalOpen.value = true;
	} catch (error) {
	  console.error('Error fetching stock details:', error);
	}
  };
  
  // Handle stock form submission
  const handleStockSubmit = (updatedStock) => {
	console.log('Updated Stock:', updatedStock);
	closeModal();
  };
  
  // Update the posting date when received from StockForm
  const updateSeriesPostingDate = (updatedData) => {
	if (selectedStock.value) {
	  selectedStock.value.posting_date = updatedData.posting_date;
	}
  };
  
  // Close modal
  const closeModal = () => {
	isModalOpen.value = false;
	selectedStock.value = null;
  };
  
  // Change page handler
  const changePage = (page) => {
	if (page >= 1 && page <= totalPages.value) {
	  currentPage.value = page;
	}
  };
  
  // Fetch series numbers on mount
  onMounted(() => {
	fetchSeriesNumbers();
  });
  </script>