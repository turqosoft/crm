<template>
  <div>
    <header class="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-3 py-2.5 sm:px-5">
      <!-- <Breadcrumbs class="h-7" :items="breadcrumbs" /> -->
      <div class="flex justify-end w-full">
    <Button variant="solid" @click="saveDemand" class="bg-black text-white rounded px-4 py-2 hover:bg-gray-700">
      {{ __('Save') }}
    </Button>
  </div>
    </header>

    <!-- Wrapper for Required By Date and Search Item Fields -->
    <div class="mb-4 px-4 sm:px-6 lg:px-10">
      <div class="mb-4 w-full max-w-md mx-auto sm:max-w-lg">
        <FormControl
          v-model="demandData.schedule_date"
          :label="__('Required By')"
          type="date"
          class="block w-full"
        />
      </div>

      <div class="w-full max-w-md mx-auto sm:max-w-lg">
        <FormControl
          v-model="searchQuery"
          :label="__('Search Item')"
          placeholder="Enter item..."
          @input="searchItemGroup"
          class="block w-full"
        />
      </div>
    </div>

    <div class="w-full max-w-4xl mx-auto py-5">
      <!-- Form Controls -->
      <div>
        <div class="grid grid-cols-2 gap-10 mb-4">
          <div>
            <FormControl
              v-model="demandData.username"
              :label="__('Username')"
              class="mb-4"
              v-show="false"
              readonly
            />
            <FormControl
              v-model="demandData.user_types"
              :label="__('User Types')"
              v-show="false"
              class="mb-4"
            />
            <!-- Conditionally show the Customer Info field -->
            <FormControl
              v-if="showCustomerInfo"
              v-model="demandData.customer_info"
              :label="__('Customer Info')"
              v-show="false"
              class="mb-4"
            />
            <!-- Conditionally show the Branch field -->
            <FormControl
              v-if="showBranch"
              v-model="demandData.branch"
              :label="__('Branch')"
              v-show="false"
              class="mb-4"
            />
          </div>
        </div>

        <!-- Tabs for Item Detail and Cart -->
        <div class="mt-6">
          <div class="tabs">
            <div class="tab-titles flex border-b">
              <!-- Item Detail Tab -->
              <button
                :class="['tab-title px-4 py-2 text-sm font-medium', activeTab === 'item-detail' ? 'active-tab bg-blue-500 text-white' : 'bg-gray-100 text-gray-700']"
                @click="activeTab = 'item-detail'"
              >
                {{ __('Item') }}
              </button>
              <!-- Cart Tab -->
              <button
                :class="['tab-title px-4 py-2 text-sm font-medium', activeTab === 'cart' ? 'active-tab bg-blue-500 text-white' : 'bg-gray-100 text-gray-700']"
                @click="activeTab = 'cart'"
              >
                {{ __('Cart') }}
              </button>
            </div>

            <!-- Tab Content -->
            <div class="tab-content mt-4">
              <!-- Item Detail Tab Content -->
              <div v-if="activeTab === 'item-detail'">
                <div class="text-lg font-semibold mb-2">{{ __('Item List') }}</div>
                <div class="grid grid-cols-1 gap-4">
                  <div
                    v-for="item in filteredItemList"
                    :key="item.value"
                    class="border p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                    @click="openModal(item)"
                  >
                    <div class="text-lg font-semibold">{{ item.label }}</div>
                    <div class="text-lg font-semibold">{{ item.item_code }}</div>
                  </div>
                </div>
              </div>

              <!-- Cart Tab Content -->
              <div v-if="activeTab === 'cart'">
                <div class="text-lg font-semibold mb-2">{{ __('Cart Items') }}</div>
                <div v-if="cartItems.length === 0" class="text-gray-500">{{ __('No items in cart') }}</div>
                <table v-else class="min-w-full table-auto border-collapse">
                  <thead>
                    <tr class="bg-gray-100">
                      <th class="border-b px-4 py-2 text-left">{{ __('Item Name') }}</th>
                      <th class="border-b px-4 py-2 text-left">{{ __('Item Code') }}</th>
                      <th class="border-b px-4 py-2 text-left">{{ __('Quantity') }}</th>
                      <th class="border-b px-4 py-2 text-left">{{ __('Notes') }}</th>
                      <th class="border-b px-4 py-2 text-left">{{ __('Actions') }}</th> <!-- New column for action buttons -->
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in cartItems" :key="index" class="hover:bg-gray-50">
                      <td class="border-b px-4 py-2">{{ item.name }}</td>
                      <td class="border-b px-4 py-2">{{ item.code }}</td>
                      <td class="border-b px-4 py-2">{{ item.quantity }}</td>
                      <td class="border-b px-4 py-2">{{ item.notes }}</td>
                      <td class="border-b px-4 py-2">
                        <!-- Remove button -->
                        <button
                          class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                          @click="removeFromCart(index)"
                        >
                          {{ __('Remove') }}
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Success Message -->
      <div v-if="successMessage" class="fixed bottom-5 right-5 p-4 bg-green-500 text-white rounded-lg">
        {{ successMessage }}
      </div>

      <!-- Popup Modal -->
      <div
        v-if="showModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      >
        <div class="bg-white rounded-lg p-6 w-96">
          <h2 class="text-lg font-semibold mb-4">{{ __('Item Details') }}</h2>
          <div class="mb-4 flex">
            <span class="font-medium">{{ __('Item Code:') }}</span>
            <span class="text-gray-900 ml-2">{{ selectedItem.item_code }}</span>
          </div>
          <div class="mb-4 flex">
            <span class="font-medium">{{ __('Item Name:') }}</span>
            <span class="text-gray-900 ml-2">{{ selectedItem.item_name }}</span>
          </div>
          <FormControl
            v-model="selectedItem.qty"
            :label="__('Quantity')"
            type="number"
            class="mb-4"
            autofocus
            
          />
          <FormControl
            v-model="selectedItem.notes"
            :label="__('Notes')"
            type="textarea"
            class="mb-4"
          />
          <div class="flex justify-end space-x-4">
            <Button variant="solid" @click="saveItemDetails">
              {{ __('Save') }}
            </Button>
            <Button variant="outline" @click="closeModal">
              {{ __('Cancel') }}
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { reactive, ref, onMounted, computed } from 'vue'
import { createResource } from 'frappe-ui'
import { showToast } from '../../utils'
// Reactive state for demand data
const demandData = reactive({
  username: '',
  pos: '', // Added POS field (assuming it is needed)
  user_types: '',
  customer_info: '',
  branch: '',
  schedule_date: '',
  selected_item: '', // Field for selected item
  itemList: [], // List of items
})
const searchItemGroup = ref('')
// State for modal and active tab
const showModal = ref(false)
const activeTab = ref('item-detail')
const selectedItem = reactive({
  item_code: '',
  item_name: '',
  qty: '',
  uom: '', // Added UOM field
  notes: '',
})

// Cart state
const cartItems = ref([])

// Resource for fetching user details
const userDetails = createResource({
  url: 'tqerp_horticorp.tqerp_horticorp.utils.get_user_details',
  cache: ['userDetails'],
  auto: true,
})

// Resource for fetching item list
const itemListResource = createResource({
  url: 'tqerp_horticorp.tqerp_horticorp.utils.get_item_details_list_item',
  cache: ['itemList'],
  auto: true,
})

// Resource for saving demand data
const saveResource = createResource({
  url: 'frappe.client.insert',
  method: 'POST',
  makeParams() {
    return {
      doc: {
        doctype: 'Material Demand',
        user: demandData.username, // Posting user
        pos: demandData.pos, // Posting POS
        branch: demandData.branch,
        schedule_date: demandData.schedule_date, // Posting branch
        items: cartItems.value.map(item => ({
          item_name: item.name,
          item_code: item.code,
          qty: item.quantity,
          uom: item.uom, 
          notes: item.notes
        })),
      },
    }
  },
  cache: false,
})

// Success message ref
const successMessage = ref('')

// Computed properties for conditional display
const showCustomerInfo = computed(() => demandData.user_types === 'Customer')
const showBranch = computed(() => demandData.user_types === 'Branch')

// Fetch user details
const fetchUserDetails = () => {
  userDetails.fetch().then(response => {
    demandData.username = response.username
    demandData.pos = response.pos // Assuming POS is part of the response
    demandData.user_types = response.user_types
    demandData.customer_info = response.customer_info
    demandData.branch = response.branch
  }).catch(error => {
    console.error('Error fetching user details:', error.message || 'Unknown error')
    showToast('Error', 'Error fetching user details', 'x')
  })
}

// Fetch item list
const fetchItemList = () => {
  itemListResource.fetch().then(response => {
    demandData.itemList = response.map(item => ({
      value: item.item_name,
      label: item.item_name,
      item_code: item.item_code,
    }))
  }).catch(error => {
    console.error('Error fetching item list:', error.message || 'Unknown error')
    showToast('Error', 'Error fetching item list', 'x')
  })
}

// Modal Methods
const openModal = (item) => {
  selectedItem.item_code = item.item_code
  selectedItem.item_name = item.label
  selectedItem.qty = ''
  selectedItem.uom = '' // UOM field initialized in the modal
  selectedItem.notes = ''
  showModal.value = true
  // Check if item already exists in cart and populate quantity
  const existingItem = cartItems.value.find(cartItem => cartItem.code === item.item_code)
  if (existingItem) {
    selectedItem.qty = existingItem.quantity
  } else {
    selectedItem.qty = ''
  }

}

const closeModal = () => {
  showModal.value = false
}
const saveItemDetails = () => {
  // Check if quantity is valid
  if (!selectedItem.qty || selectedItem.qty <= 0) {
    showToast('Error', 'Please enter a valid quantity', 'x');
    return; // Prevent saving if the quantity is invalid
  }

  // Save item details logic here (e.g., add to cart)
  cartItems.value.push({
    name: selectedItem.item_name,
    code: selectedItem.item_code,
    quantity: selectedItem.qty,
    uom: selectedItem.uom, // Adding UOM to cart
    notes: selectedItem.notes
  });

  showToast('Success', 'Item details saved', 'check');
  closeModal();
}

// Save demand data
const saveDemand = async () => {
  try {
    await saveResource.submit(
      {},
      {
        onSuccess(data) {
          // Show success message
          successMessage.value = 'Material Demand saved successfully!'

          // Clear the cart after saving
          cartItems.value = []

          // Optionally, display a toast notification after clearing the cart
          showToast('Success', 'Cart cleared after saving the demand', 'check')

          // Hide success message after 3 seconds
          setTimeout(() => {
            successMessage.value = ''
          }, 3000); // 3000ms = 3 seconds
        },
        onError(err) {
          showToast('Error', err.messages?.[0] || err, 'x')
        },
      }
    )
  } catch (err) {
    showToast('Error', err.message || 'Error saving demand', 'x')
  }
}

// Remove item from cart
const removeItem = (itemCode) => {
  cartItems.value = cartItems.value.filter(item => item.code !== itemCode)
  showToast('Success', 'Item removed from cart', 'check')
}

// Fetch data on mount
onMounted(() => {
  const today = new Date().toISOString().split('T')[0]  // Get today's date in YYYY-MM-DD format
  demandData.schedule_date = today  // Set it as the default value
  
  fetchUserDetails()
  fetchItemList()
})
// Function to remove item from cart
function removeFromCart(index) {
  cartItems.value.splice(index, 1)
}
// Search functionality
const searchQuery = ref('')
const filteredItemList = computed(() => {
  return demandData.itemList.filter(item =>
    item.label.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})
</script>