<template>
  <div>
    <!-- Header with Breadcrumbs and Save Button -->
    <header class="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-3 py-2.5 sm:px-5">
      <Breadcrumbs class="h-7" :items="breadcrumbs" />
      <Button variant="solid" @click="submitForm">
        {{ __('Save Request') }}
      </Button>
    </header>

    <!-- Material Request Section -->
    <h2 class="text-xl font-semibold mb-2 text-center pt-[10mm]">Material Request</h2>


    <!-- Main Content Area -->
    <div class="w-full max-w-4xl mx-auto py-2">
      <div class="flex flex-col items-center">
        <!-- Input Form for Material Request -->
        <div class="w-full max-w-xs mb-4">
          <div class="p-3">
            <input
              type="text"
              placeholder="Search items"
              v-model="searchQuery"
              @input="searchItems"
              class="border p-2 rounded w-full"
            />
          </div>

          <!-- Material Request Type -->
          <label for="materialRequestType" class="block mt-4">Material Request Type:</label>
          <select id="materialRequestType" v-model="materialRequestType" class="border p-2 rounded w-full">
            <option disabled value="">Select request type</option>
            <option value="Purchase">Purchase</option>
            <option value="Manufacture">Manufacture</option>
            <option value="Material Transfer">Material Transfer</option>
            <option value="Material Issue">Material Issue</option>
            <option value="Customer Provided">Customer Provided</option>
          </select>

          <!-- Transaction Date (Hidden) -->
          <label for="transactionDate" class="block mt-4" v-show="false">Transaction Date:</label>
          <input
            id="transactionDate"
            v-model="transactionDate"
            type="date"
            v-show="false"
            class="border p-2 rounded w-full"
          />

          <!-- Warehouse (Hidden) -->
          <label for="warehouse" class="block mt-4" v-show="false">Warehouse:</label>
          <input
            id="warehouse"
            v-model="defaultWarehouse"
            type="text"
            class="border p-2 rounded w-full"
            v-show=false
            disabled
          />

          <!-- Schedule Date -->
          <label for="scheduleDate" class="block mt-4">Schedule Date:</label>
          <input
            id="scheduleDate"
            v-model="scheduleDate"
            type="date"
            class="border p-2 rounded w-full"
          />
        </div>

        <!-- Tabs for Item Details and Cart -->
        <div class="w-full flex space-x-4 mb-3">
          <button 
            :class="['py-2 px-4 rounded-lg transition-colors', activeTab === 'itemDetails' ? 'bg-black text-white font-bold' : 'bg-gray-200 text-gray-700']" 
            @click="activeTab = 'itemDetails'">
            {{ __('Item Details') }}
          </button>
          <button 
            :class="['py-2 px-4 rounded-lg transition-colors', activeTab === 'cart' ? 'bg-black text-white font-bold' : 'bg-gray-200 text-gray-700']" 
            @click="activeTab = 'cart'">
            {{ __('Cart') }}
          </button>
        </div>

        <!-- Display item details if the active tab is "itemDetails" -->
        <div v-if="activeTab === 'itemDetails'" class="w-full bg-white p-3 rounded-lg shadow-lg">
          <h2 class="text-lg font-semibold mb-3">Item Details</h2>
          <!-- Item details boxes -->
          <div class="space-y-2">
            <div v-for="item in filteredItemDetails" :key="item.item_code" class="border p-3 rounded-lg shadow-md bg-gray-50">
              <h3 class="font-semibold text-base mb-2">{{ item.item_name }}</h3>
              <p><strong>Item Code:</strong> {{ item.item_code }}</p>
              <p><strong>Warehouse:</strong> {{ defaultWarehouse }}</p>
              <Button variant="solid" @click="openItemPopup(item)" class="mt-3">Add to Cart</Button>
            </div>
          </div>
        </div>

        <!-- Cart tab content -->
        <div v-if="activeTab === 'cart'" class="w-full bg-white p-3 rounded-lg shadow-lg">
          <h2 class="text-lg font-semibold mb-3">Cart</h2>
          <div v-for="(item, index) in cartItems" :key="index" class="border-b py-3">
            <div><strong>Item Name:</strong> {{ item.item_name }}</div>
            <div><strong>Item Code:</strong> {{ item.item_code }}</div>
            <div><strong>Quantity:</strong> {{ item.qty }}</div>
            <div><strong>Warehouse:</strong> {{ item.warehouse }}</div>
          </div>
        </div>

        <!-- Success Message -->
        <div v-if="successMessage" class="fixed bottom-5 right-5 p-3 bg-green-500 text-white rounded-lg">
          {{ successMessage }}
        </div>

        <!-- Item Quantity Popup -->
        <div v-if="isPopupOpen" class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div class="bg-white p-4 rounded-lg shadow-lg w-72">
            <h3 class="font-semibold mb-3"> {{ currentItem.item_name }}</h3>
            <p><strong>Item Code:</strong> {{ currentItem.item_code }}</p>
            <p><strong>Warehouse:</strong> {{ defaultWarehouse }}</p>
            <label for="itemQuantity" class="block mt-3">Quantity:</label>
            <input
              id="itemQuantity"
              v-model="qty"
              type="number"
              class="border p-2 rounded w-full"
              min="1"
            />
            <div class="flex justify-end mt-3">
              <Button variant="outline" @click="closeItemPopup">Cancel</Button>
              <Button class="ml-2" variant="solid" @click="addItemToCart">Add to Cart</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, computed } from 'vue';
import { createResource } from 'frappe-ui';
import { showToast } from '../../utils';

const materialRequestType = ref('');
const transactionDate = ref(new Date().toISOString().split('T')[0]);
const scheduleDate = ref('');
const successMessage = ref('');
const qty = ref(1);
const isPopupOpen = ref(false);
const currentItem = ref(null);
const cartItems = ref([]);
const activeTab = ref('itemDetails');
const searchQuery = ref('');

const itemDetailsResource = createResource({
  url: 'tqerp_horticorp.tqerp_horticorp.utils.get_item_details_list',
  cache: ['itemDetails'],
  auto: true,
});

const warehouseResource = createResource({
  url: 'tqerp_horticorp.tqerp_horticorp.utils.get_all_warehouses',
  auto: true,
});

// Use the first warehouse as the default value
const defaultWarehouse = computed(() => (warehouseResource.data && warehouseResource.data[0]?.name) || '');

const itemDetails = computed(() => itemDetailsResource.data || []);

const filteredItemDetails = computed(() => {
  return itemDetails.value.filter(item =>
    item.item_name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const saveResource = createResource({
  url: 'frappe.client.insert',
  method: 'POST',
  makeParams() {
    return {
      doc: {
        doctype: 'Material Request',
        material_request_type: materialRequestType.value,
        transaction_date: transactionDate.value,
        schedule_date: scheduleDate.value,
        warehouse: defaultWarehouse.value,
        items: cartItems.value.map(item => ({
          item_code: item.item_code,
          item_name: item.item_name,
          qty: item.qty,
          warehouse: item.warehouse
        })),
      },
    };
  },
});

const submitForm = async () => {
  if (!materialRequestType.value || !transactionDate.value || !scheduleDate.value || !defaultWarehouse.value || cartItems.value.length === 0) {
    showToast('Please fill out all fields and add items to the cart.', 'error');
    return;
  }

  const invalidItems = cartItems.value.filter(item => item.qty <= 0);
  if (invalidItems.length > 0) {
    showToast('Please ensure all items have a valid quantity greater than zero', 'error');
    return;
  }

  try {
  await saveResource.fetch();
  successMessage.value = 'Material request saved successfully';
  showToast('Material request saved successfully', 'success');
  
  // Clear the success message after 5 seconds
  setTimeout(() => {
    successMessage.value = ''; // Clear the success message
  }, 5000);

  clearForm();
} catch (error) {
  console.error('Failed to save material request:', error);
  showToast('Failed to save material request. Please try again.', 'error');
}
};
const openItemPopup = (item) => {
  currentItem.value = item;
  isPopupOpen.value = true;
};

const closeItemPopup = () => {
  isPopupOpen.value = false;
  currentItem.value = null;
};

const addItemToCart = () => {
  if (qty.value > 0) {
    cartItems.value.push({
      item_code: currentItem.value.item_code,
      item_name: currentItem.value.item_name,
      qty: qty.value,
      warehouse: defaultWarehouse.value,
    });
    closeItemPopup();
  }
};

const searchItemName = () => {
  // Placeholder for additional logic if needed for advanced searching
};

const clearForm = () => {
  materialRequestType.value = '';
  transactionDate.value = '';
  scheduleDate.value = '';
  cartItems.value = [];
};
</script>
