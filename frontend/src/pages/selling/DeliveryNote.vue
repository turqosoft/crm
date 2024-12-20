<template>
  <div class="p-4">
    <!-- Filters -->
    <div class="mt-4 flex flex-wrap gap-4 items-center">
      <!-- Filter by ID -->
      <input
        v-model="filters.name"
        type="text"
        placeholder="ID"
        class="border px-3 py-2 rounded-md shadow-sm focus:ring focus:ring-blue-300 flex-1 min-w-[200px]"
      />
      <!-- Filter by schedule date -->
      <input
        v-model="filters.schedule_date"
        type="date"
        placeholder="Date"
        class="border px-3 py-2 rounded-md shadow-sm focus:ring focus:ring-blue-300 flex-1 min-w-[200px]"
      />
    </div>

    <!-- Horizontal Line to separate Filters and Content -->
    <hr class="my-6 border-t-2 border-gray-200" />

    <!-- List of Delivery Notes -->
    <div v-if="deliveryNotes.length">
      <ul class="space-y-4">
        <li
          v-for="note in deliveryNotes"
          :key="note.name"
          class="p-4 border border-gray-200 rounded-lg bg-gray-50 shadow-sm cursor-pointer hover:bg-gray-100"
          @click="openPopup(note)"
        >
          <p class="text-lg font-semibold text-gray-800">{{ note.name }}</p>
          <p class="text-gray-600">
            <strong>Posting Date:</strong>
            {{ formatDate(note.posting_date) }}
          </p>
          <p class="text-gray-600">
            <strong>Note Type:</strong>
            {{ note.noteType }}
          </p>
          <p class="text-gray-600">
            <strong>Status:</strong>
            {{ note.status }}
          </p>
          <p v-if="note.noteType === 'Sales Return'" class="text-gray-600">
            <strong>Return Against:</strong>
            {{ note.return_against }}
          </p>
        </li>
      </ul>
    </div>
    <div v-else>
      <p>Loading delivery notes...</p>
    </div>

    <!-- Pagination Section -->
    <div class="flex justify-center items-center mt-4">
      <div class="flex space-x-2 justify-center">
        <!-- Clickable boxes for items per page with smaller size and custom styles -->
        <button
          v-for="option in [20, 100, 500, 2500]"
          :key="option"
          :class="[ 
            'px-3 py-1 border rounded-md bg-blue-100 text-xs text-gray-800 hover:bg-blue-200 transition duration-200',
            itemsPerPage === option ? 'bg-gray-300 text-white' : 'bg-blue-100',
          ]"
          @click="changeItemsPerPage(option)"
        >
          {{ option }}
        </button>
      </div>
    </div>

    <!-- Popup Modal -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div
        class="bg-white rounded-lg shadow-lg w-full max-w-[95%] sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-[calc(24rem+4cm)] mx-auto"
      >
        <DeliveryNoteForm
          :deliveryNote="selectedNote"
          :updateDeliveryNote="updateDeliveryNote"
          :isReadOnly="selectedNote?.is_return"
          @close="closePopup"
          @update="updateDeliveryNoteHandler"
        />
      </div>
    </div>
  </div>
   <!-- Success Message -->
<!-- <div v-if="successMessage" class="fixed bottom-5 right-5 p-4 bg-green-500 text-white rounded-lg">
    {{ successMessage }}
</div> -->

</template>
<script setup>
import { ref, onMounted, watch } from 'vue';
import DeliveryNoteForm from './DeliveryNoteForm.vue';
import { showToast } from '../../utils'

const updateDeliveryNote= ref([]);
const deliveryNotes = ref([]);
const isModalOpen = ref(false);
const selectedNote = ref(null);
const successMessage = ref([]);
// Filters object to bind to the input field
const filters = ref({
  name: '',
  schedule_date: ''
});

//format date
const formatDate = (date) => {
  if (!date) return '';
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  const formattedDate = new Date(date).toLocaleDateString('en-GB', options);
  return formattedDate;
};

// Pagination variables 
const currentPage = ref(1);
const totalPages = ref(1);
const itemsPerPage = ref(20); // Default items per page is 20

// Watch filters and refetch data when any filter changes
watch(filters, () => {
  fetchDeliveryNotes();
}, { deep: true });

// Fetch delivery notes from the server with filters and pagination


// Function to get the logged-in user
const getLoggedInUser = async () => {
  try {
    // Fetch logged-in user and customer info from the backend method
    const response = await fetch('/api/method/tqerp_horticorp.tqerp_horticorp.utils.get_logged_user_with_customer_info');
    const data = await response.json();

    if (data.message) {
      console.log("Fetched session user and customer info:", data.message);
      return data.message; // Contains both user and customer info
    } else {
      console.error("Error fetching logged-in user");
      return null;
    }
  } catch (error) {
    console.error("Error fetching logged-in user:", error);
    return null;
  }
};

// Function to fetch Delivery Notes based on the logged-in user's customer info
const fetchDeliveryNotes = async () => {
  try {
    // Get the logged-in user and their customer info
    const sessionData = await getLoggedInUser();
    if (!sessionData || !sessionData.customer_info) {
      console.error("Customer info is not available for the logged-in user.");
      return;
    }

    // Apply filter for customer info
    const appliedFilters = [
      ["customer", "=", sessionData.customer_info] // Filter by customer info
    ];

    // Add filters for name (ID) and schedule_date (Posting Date)
    if (filters.value.name) {
      appliedFilters.push(["name", "like", `%${filters.value.name}%`]); // Filter by ID (Name)
    }
    if (filters.value.schedule_date) {
      appliedFilters.push(["posting_date", "=", filters.value.schedule_date]); // Filter by Posting Date
    }

    // Log filters to verify the applied filter
    console.log("Filters applied:", JSON.stringify(appliedFilters));

    // Fetch count of Delivery Notes for the logged-in user's customer
    const countResponse = await fetch(`/api/resource/Delivery Note?filters=${JSON.stringify(appliedFilters)}&fields=["name"]`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!countResponse.ok) {
      throw new Error(`HTTP error! status: ${countResponse.status}`);
    }

    const countData = await countResponse.json();
    const totalItems = countData.data.length;

    if (totalItems === 0) {
      console.warn('No delivery notes found for this customer');
    }

    totalPages.value = Math.ceil(totalItems / itemsPerPage.value);

    // Fetch the actual delivery notes with applied filters
    const response = await fetch(`/api/resource/Delivery Note?fields=["name", "posting_date", "status", "is_return", "return_against"]&filters=${JSON.stringify(appliedFilters)}&limit_page_length=${itemsPerPage.value}&start=${(currentPage.value - 1) * itemsPerPage.value}`, {
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
    console.log('Fetched Delivery Notes:', data);

    if (data.data.length === 0) {
      console.warn('No records found for this customer with the applied filters.');
    }

    // Map and assign fetched delivery notes
    deliveryNotes.value = (data.data || []).map(note => {
      note.noteType = (note.is_return && note.return_against) ? 'Sales Return' : 'Delivery Note';
      return note;
    });

  } catch (error) {
    console.error('Error fetching delivery notes:', error);
  }
};

const fetchDeliveryNoteDetails = async (noteName) => {
  try {
    const response = await fetch(`/api/resource/Delivery Note/${noteName}?fields=["name", "posting_date", "customer", "items", "is_return", "is_submitted"]`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    selectedNote.value = {
      ...data.data,
      isSubmitted: data.data.is_submitted || false,
    };

    console.log('Fetched Delivery Note Details:', selectedNote.value);
  } catch (error) {
    console.error('Error fetching delivery note details:', error);
  }
};

const openPopup = async (note) => {
  await fetchDeliveryNoteDetails(note.name);
  isModalOpen.value = true;
};

const closePopup = () => {
  isModalOpen.value = false;
  selectedNote.value = null;
};

const updateDeliveryNoteHandler = async (updatedNoteData) => {
  try {
    const updatedItems = updatedNoteData.items.map(item => ({
      ...item,
      qty: item.qty,
    }));
    updatedNoteData.items = updatedItems;

    console.log('Updated Note Data before sending to server:', updatedNoteData);

    if (selectedNote.value.is_return) {
      const updateResponse = await fetch(
        `/api/resource/Delivery Note/${selectedNote.value.name}`,
        {
          method: 'PUT',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedNoteData),
        }
      );

      if (!updateResponse.ok) {
        throw new Error(`HTTP error! status: ${updateResponse.status}`);
      }

      console.log(`Sales Return ${selectedNote.value.name} updated successfully.`);
      showPopup('Update successful!', 'success');
    } else {
      const createResponse = await fetch(`/api/resource/Delivery Note`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_return: true,
          return_against: selectedNote.value.name,
          ...updatedNoteData,
        }),
      });

      if (!createResponse.ok) {
        throw new Error(`HTTP error! status: ${createResponse.status}`);
      }

      console.log('New return note created successfully.');
      showPopup('Return note created successfully!', 'success');
    }

    closePopup();
    fetchDeliveryNotes();
  } catch (error) {
    console.error('Error handling delivery note update:', error);
    showPopup('An error occurred. Please try again.', 'error');
  }
};

// Function to display a popup message
const showPopup = (message, type) => {
  // Remove any existing popup to avoid duplicates
  const existingPopup = document.querySelector('.popup-message');
  if (existingPopup) existingPopup.remove();

  // Create a new popup element
  const popup = document.createElement('div');
  popup.className = `popup-message fixed top-5 right-5 z-50 px-4 py-2 rounded shadow-lg text-white 
    ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} transition-opacity duration-300 opacity-100`;
  popup.innerText = message;

  // Append the popup to the body
  document.body.appendChild(popup);

  // Automatically hide the popup after 3 seconds
  setTimeout(() => {
    popup.classList.add('opacity-0'); // Fades out 
    setTimeout(() => popup.remove(), 300); // Ensures element is removed after fade-out
  }, 3000);
};
const changePage = (newPage) => {
  if (newPage < 1 || newPage > totalPages.value) return;
  currentPage.value = newPage;
  fetchDeliveryNotes();
};

const changeItemsPerPage = (newItemsPerPage) => {
  itemsPerPage.value = newItemsPerPage;
  currentPage.value = 1; // Reset to the first page when items per page is changed
  fetchDeliveryNotes();
};

// Fetch data initially when component is mounted
onMounted(() => {
  fetchDeliveryNotes();
});
</script>
<style>
</style>