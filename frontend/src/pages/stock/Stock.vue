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
						params: {
							courseName: 'new',
						},
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
			<!-- Display stock reconciliation series numbers -->
			<div v-if="seriesNumbers.length">
				<ul class="space-y-4">
					<li
						v-for="series in seriesNumbers"
						:key="series.name"
						class="p-4 border border-gray-200 rounded-lg bg-gray-50 shadow-sm cursor-pointer hover:bg-gray-100 transition duration-200"
						@click="fetchStockDetails(series.name)"
					>
						<p class="text-lg font-semibold text-gray-800">{{ series.name }}</p>
						<p class="text-gray-600">Posting Date: {{ series.posting_date }}</p>
					</li>
				</ul>
			</div>
			<div v-else>
				<p class="text-gray-500">Loading series numbers...</p>
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
					<!-- Show the StockForm component -->
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
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Breadcrumbs, Button } from 'frappe-ui';
import { Plus } from 'lucide-vue-next';
import StockForm from './StockForm.vue'; // Ensure to import your StockForm component

// Define reactive state for series numbers and modal
const seriesNumbers = ref([]);
const selectedStock = ref(null);
const isModalOpen = ref(false);

const fetchSeriesNumbers = async () => {
	let allSeries = [];
	let page = 1; 
	const pageSize = 100; 

	while (true) {
		try {
			const response = await fetch(`/api/resource/Stock Reconciliation?fields=["name", "posting_date"]&limit=${pageSize}&page=${page}`, {
    			method: 'GET',
    			headers: {
        					'Accept': 'application/json',
							'Content-Type': 'application/json',
    }
});


			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();

			if (data.data) {
				// Map each stock reconciliation series with its name and posting_date
				allSeries = allSeries.concat(
					data.data.map(stock => ({
						name: stock.name,
						posting_date: stock.posting_date || 'N/A',  // Assign posting_date or 'N/A' as fallback
					}))
				);
			}

			// Break the loop if we've retrieved less than the page size (no more records)
			if (data.data.length < pageSize) {
				break;
			}

			page++;
		} catch (error) {
			console.error('Error fetching series numbers:', error);
			break;
		}
	}

	// Update the seriesNumbers reactive variable with fetched data
	seriesNumbers.value = allSeries;
};

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
		selectedStock.value = stockDetails.data; // Set the selected stock details for modal
		isModalOpen.value = true; // Open the modal
	} catch (error) {
		console.error('Error fetching stock details:', error);
	}
};

// Update the posting date when received from StockForm
const updateSeriesPostingDate = (updatedData) => {
	if (selectedStock.value) {
		selectedStock.value.posting_date = updatedData.posting_date;
	}
};

// Handle stock form submission
const handleStockSubmit = (updatedStock) => {
	// Process the updated stock data
	console.log('Updated Stock:', updatedStock);
	closeModal(); // Optionally close the modal after submission
};

// Close modal
const closeModal = () => {
	isModalOpen.value = false; // Close the modal
	selectedStock.value = null; // Reset selected stock
};

// Fetch the series numbers on component mount
onMounted(() => {
	fetchSeriesNumbers();
});
</script>