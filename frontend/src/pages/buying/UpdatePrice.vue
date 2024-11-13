<template>
    <div>
        <!-- Header with Breadcrumbs and Save Button -->
        <header class="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-3 py-2.5 sm:px-5">

            <Button variant="solid" @click="submitForm">
                {{ __('Save Prices') }}
            </Button>
        </header>

        <!-- Main Content Area -->
        <div class="w-full max-w-4xl mx-auto py-5">
            <div class="flex flex-col items-center">

                <!-- Price List Section -->
                <h2 class="text-xl font-semibold mb-5">Price List</h2>

                <!-- Input Form for Supplier Name and Price List -->
                <div class="w-full max-w-xs mb-6 space-y-4">
                    <div>
                        <label for="supplierName" class="block">Supplier Name:</label>
                        <input
                            id="supplierName"
                            v-model="supplierName"
                            type="text"
                            class="border p-2 rounded w-full"
                            placeholder="Supplier name"
                            readonly
                        />
                    </div>

                    <div>
                        <label for="priceList" class="block">Price List:</label>
                        <input
                            id="priceList"
                            type="text"
                            v-model="selectedPriceList"
                            class="border p-2 rounded w-full"
                            placeholder="Price List"
                            readonly
                        />
                    </div>
                </div>

                <!-- Tabs for Item Details and Cart -->
                <div class="w-full flex space-x-4 mb-5">
                    <button 
                        :class="['py-2 px-4 rounded-lg transition-colors', activeTab === 'itemDetails' ? 'bg-blue-500 text-white font-bold' : 'bg-gray-200 text-gray-700']" 
                        @click="activeTab = 'itemDetails'"
                    >
                        {{ __('Item Details') }}
                    </button>
                    <button 
                        :class="['py-2 px-4 rounded-lg transition-colors', activeTab === 'cart' ? 'bg-blue-500 text-white font-bold' : 'bg-gray-200 text-gray-700']" 
                        @click="activeTab = 'cart'"
                    >
                        {{ __('Cart') }}
                    </button>
                </div>

                <!-- Item Details Section -->
                <div v-if="activeTab === 'itemDetails'" class="w-full mb-4">
                    <h3 class="font-medium mb-2">{{ __('Available Items') }}</h3>
                    <div>
                        <div
                            v-for="item in itemDetails"
                            :key="item.item_code"
                            class="border p-4 rounded shadow mb-4 hover:shadow-lg transition-shadow cursor-pointer"
                            @click="openPopup(item)"
                        >
                            <h4 class="font-semibold">{{ item.item_name }}</h4>
                            <p><strong>Item Code:</strong> {{ item.item_code }}</p>
                            <p><strong>Current Rate:</strong> {{ item.price_list_rate }}</p>
                        </div>
                    </div>
                    <p v-if="itemDetails.length === 0">{{ __('No items available.') }}</p>
                </div>

                <!-- Cart Section -->
                <div v-if="activeTab === 'cart'" class="w-full mb-4">
                    <h3 class="font-medium mb-2">{{ __('Cart') }}</h3>
                    <div v-if="cartItems.length === 0">{{ __('Cart is empty.') }}</div>
                    <table class="min-w-full border border-gray-300">
                        <thead>
                            <tr class="bg-gray-200">
                                <th class="border px-4 py-2 text-left">{{ __('Item Name') }}</th>
                                <th class="border px-4 py-2 text-left">{{ __('Item Code') }}</th>
                                <th class="border px-4 py-2 text-left">{{ __('New Rate') }}</th>
                                <th class="border px-4 py-2 text-left">{{ __('Actions') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in cartItems" :key="index">
                                <td class="border px-4 py-2">{{ item.name }}</td>
                                <td class="border px-4 py-2">{{ item.item_code }}</td>
                                <td class="border px-4 py-2">{{ item.newRate }}</td>
                                <td class="border px-4 py-2">
                                    <button class="text-red-500 hover:text-red-700" @click="removeFromCart(index)">{{ __('Remove') }}</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Success Message -->
                <div v-if="successMessage" class="fixed bottom-5 right-5 p-4 bg-green-500 text-white rounded-lg">
                    {{ successMessage }}
                </div>

                <!-- Popup Modal -->
                <div v-if="showModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div class="bg-white rounded-lg p-5">
                        <h3 class="font-semibold mb-2">Item Details</h3>
                        <p><strong>Item Name:</strong> {{ selectedItem.item_name }}</p>
                        <p><strong>Item Code:</strong> {{ selectedItem.item_code }}</p>
                        <p v-if="selectedItem.price_list_rate !== undefined">
                            <strong>Current Rate:</strong> {{ selectedItem.price_list_rate }}
                        </p>
                        <div class="mb-4">
                            <label for="newRate" class="block">New Rate:</label>
                            <input
                                id="newRate"
                                v-model="price_list_rate"
                                type="number"
                                class="border p-2 rounded w-full"
                                placeholder="Enter new rate"
                            />
                        </div>
                        <button class="bg-blue-500 text-white py-2 px-4 rounded" @click="addRate">Add</button>
                        <button class="border py-2 px-4 rounded" @click="closePopup">Close</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
// Import necessary modules and hooks
import { ref, onMounted, computed } from 'vue';
import { Button, createResource } from 'frappe-ui';
import { showToast } from '../../utils';

// Reactive state for supplier name, price list, etc.
const supplierName = ref('');
const selectedPriceList = ref(''); 
const price_list_rate = ref(0); 
const successMessage = ref('');
const showModal = ref(false); 
const selectedItem = ref(null);
const activeTab = ref('itemDetails'); // State for the active tab
const cartItems = ref([]); // State for cart items

// Resource for fetching item details
const itemDetailsResource = createResource({
    url: 'tqerp_horticorp.tqerp_horticorp.utils.get_item_details_list',
    cache: ['itemDetails'],
    auto: true,
});

// Handle errors for item details
const handleItemDetailsError = (error) => {
    console.error("Error fetching item details:", error);
    showToast('Error fetching item details: ' + error.message, 'error');
};

// Check for item details errors
itemDetailsResource.error && handleItemDetailsError(itemDetailsResource.error);

// Computed property for item details
const itemDetails = computed(() => itemDetailsResource.data || []);

// Resource for fetching supplier details
const supplierDetailsResource = createResource({
    url: 'tqerp_horticorp.tqerp_horticorp.utils.get_supplier_details',
    cache: ['supplierDetails'],
    auto: true,
});

// Fetch supplier details when the component mounts
onMounted(async () => {
    try {
        await supplierDetailsResource.fetch();
        if (supplierDetailsResource.data && supplierDetailsResource.data.supplier_name) {
            supplierName.value = supplierDetailsResource.data.supplier_name;
            selectedPriceList.value = supplierDetailsResource.data.default_price_list;
            const priceListRates = supplierDetailsResource.data.price_list_rates || {};

            itemDetailsResource.data.forEach(item => {
                item.price_list_rate = priceListRates[item.item_code] || 0;
            });
        } else {
            showToast('User is not a supplier', 'warning');
        }
    } catch (error) {
        console.error('Error fetching supplier details:', error);
        showToast('Error fetching supplier details: ' + error.message, 'error');
    }
});

// Resource for saving item price
const saveResource = createResource({
    url: 'frappe.client.insert',
    method: 'POST',
    makeParams() {
        // Ensure selectedItem is not null before accessing its properties
        if (selectedItem.value) {
            return {
                doc: {
                    doctype: 'Item Price',
                    supplier_name: supplierName.value,
                    price_list: selectedPriceList.value,
                    item_code: selectedItem.value.item_code,
                    item_name: selectedItem.value.item_name,
                    price_list_rate: price_list_rate.value
                },
            };
        } else {
            throw new Error("No item selected for saving prices.");
        }
    },
});

// Function to submit the form
const submitForm = async () => {
    // Check if cart is empty
    if (cartItems.value.length === 0) {
        showToast('No items in the cart to save.', 'warning');
        return;
    }

    try {
        // Process each item in the cart
        for (const item of cartItems.value) {
            selectedItem.value = item;
            price_list_rate.value = item.newRate;

            await saveResource.fetch(); // Trigger the save resource

            // Check for errors and display success message
            if (saveResource.error) {
                throw new Error('Error saving price for ' + item.item_name + ': ' + saveResource.error.message);
            }

            // Update the current rate in the itemDetails
            const itemToUpdate = itemDetails.value.find(i => i.item_code === item.item_code);
            if (itemToUpdate) {
                itemToUpdate.price_list_rate = price_list_rate.value; // Update to the new rate
            }
        }
        
        // Clear the cart and show success message
        cartItems.value = [];
        successMessage.value = 'Prices saved successfully!';

        // Clear success message after 3 seconds
        setTimeout(() => {
            successMessage.value = '';
        }, 3000);

    } catch (error) {
        console.error('Error saving prices:', error);
        showToast('Error saving prices: ' + error.message, 'error');
    }
};


// Function to open the item selection popup
const openPopup = (item) => {
    selectedItem.value = item; // Store the selected item
    price_list_rate.value = item.price_list_rate; // Set the current rate
    showModal.value = true; // Show the popup
};

// Function to close the popup
const closePopup = () => {
    showModal.value = false; // Hide the popup
};

// Function to add the new rate to the cart
const addRate = () => {
    if (!price_list_rate.value) {
        showToast('Please enter a new rate.', 'warning');
        return;
    }

    // Check if the item is already in the cart
    if (!cartItems.value.find(cartItem => cartItem.item_code === selectedItem.value.item_code)) {
        cartItems.value.push({
            name: selectedItem.value.item_name,
            item_code: selectedItem.value.item_code,
            newRate: price_list_rate.value,
        });
        showToast('Item added to cart successfully.', 'success');
    } else {
        showToast('Item already in the cart.', 'warning');
    }

    closePopup(); // Close the popup
};

// Function to remove an item from the cart
const removeFromCart = (index) => {
    cartItems.value.splice(index, 1); // Remove the item by index
    showToast('Item removed from cart.', 'info');
};
</script>

<style scoped>
/* Add your custom styles here */
</style>