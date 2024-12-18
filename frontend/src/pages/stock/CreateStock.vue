<template>
  <div>
    <!-- Header Section -->
    <header class="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-3 py-2.5 sm:px-5">
  <!-- Navigation Links or Items -->
  <div class="flex items-center space-x-2">
    <span v-for="(item, index) in navigationItems" :key="index" class="text-sm text-gray-700">
      <span>{{ item.name }}</span>
      <span v-if="index < navigationItems.length - 1" class="mx-2">/</span>
    </span>
  </div>

  <!-- Save Button Section -->
  <div>
    <Button variant="solid" @click="saveStock">
      {{ __('Save') }}
    </Button>
  </div>
</header>


    <!-- Main Content -->
    <div class="w-full max-w-4xl mx-auto py-5">
      <div class="text-lg font-semibold mb-4 text-center">
        {{ __('Stock Update') }}
      </div>


      <!-- Search Field -->
            <div class="flex items-center justify-center mb-4">
              <div class="flex-1 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
                <FormControl
                  v-model="searchQuery"
                  :label="__('Search Item')"
                  placeholder="Enter item..."
                  @input="searchItemGroup"
                />
              </div>
            </div>

            <!-- Posting Date Field -->
            <div class="flex items-center justify-center mb-4">
              <div class="flex-1 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
                <FormControl
                  v-model="reconciliationData.posting_date"
                  :label="__('Posting Date')"
                  type="date"
                  class="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg"
                  style="font-size: 7rem; padding: 2.5rem; height: 4rem;"
                />
              </div>
            </div>

            <!-- Purpose Field -->
            <div class="flex items-center justify-center mb-4">
              <div class="flex-1 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
                <FormControl
                  v-model="reconciliationData.purpose"
                  :label="__('Purpose')"
                  class="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg"
                  style="font-size: 7rem; padding: 2.5rem; height: 4rem;"
                  readonly
                />
              </div>
            </div>

            <!-- Hidden Fields -->
            <FormControl
              v-model="reconciliationData.posting_time"
              :label="__('Posting Time')"
              type="time"
              class="mb-5 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg"
              v-show="false"
              readonly
            />
            <FormControl
              v-model="reconciliationData.warehouse"
              :label="__('Warehouse')"
              class="mb-5 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg"
              v-show="false"
              readonly
            />
      <!-- Tabs for Item Details and Cart -->
      <div class="mb-4">
        <div class="flex border-b">
          <button
            @click="currentTab = 'itemDetails'"
            :class="{'border-blue-500 text-blue-500': currentTab === 'itemDetails', 'border-transparent': currentTab !== 'itemDetails'}"
            class="py-2 px-4 border-b-2 font-medium text-sm"
          >
            {{ __('Item Details') }}
          </button>
          <button
            @click="currentTab = 'cart'"
            :class="{'border-blue-500 text-blue-500': currentTab === 'cart', 'border-transparent': currentTab !== 'cart'}"
            class="py-2 px-4 border-b-2 font-medium text-sm"
          >
            {{ __('Cart') }}
          </button>
        </div>

        <!-- Item Details Section -->
        <div v-if="currentTab === 'itemDetails'" class="mt-4">
          <div
            v-for="(item, index) in filteredItems"  
            :key="index"
            class="p-4 border rounded-lg shadow-sm cursor-pointer"
            @click="openPopup(item)"
          >
            <div class="font-semibold text-lg mb-2">
              {{ item.item_name }}
            </div>
            <div>{{ item.item_code }}</div>
            <div>
              {{ __('Current Quantity: ') }} {{ item.actual_qty }}
            </div>
          </div>
        </div>

        <!-- Cart Section -->
        <div v-if="currentTab === 'cart'" class="mt-4">
          <div class="text-lg font-semibold mb-2">
            {{ __('Cart') }}
          </div>
          <div class="mt-4">
            <table class="w-full table-auto">
              <thead>
                <tr>
                  <th class="text-left px-4 py-2">{{ __('Item Code') }}</th>
                  <th class="text-left px-4 py-2">{{ __('Quantity') }}</th>
                  <th class="text-left px-4 py-2">{{ __('Warehouse') }}</th>
                  <th class="text-left px-4 py-2">{{ __('Wastage Qty') }}</th>
                  <th class="text-left px-4 py-2">{{ __('Actions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in reconciliationData.items" :key="index">
                  <td class="px-4 py-2">{{ item.item_code }}</td>
                  <td class="px-4 py-2">{{ item.qty }}</td>
                  <td class="px-4 py-2">{{ item.warehouse }}</td>
                  <td class="px-4 py-2">{{ item.wastage_qty }}</td>
                  <td class="px-4 py-2">
                    <Button @click="removeItem(index)" variant="outlined" color="red">
                      {{ __('Remove') }}
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Item Popup Modal -->
    <div v-if="showPopup" class="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div class="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 class="text-lg font-semibold mb-4">{{ __('Add Item to Cart') }}</h2>

        <div class="mb-4">
          <span class="font-semibold">{{ __('Item Name: ') }}</span>
          {{ popupData.item_name }}
        </div>

        <div class="mb-4">
          <span class="font-semibold">{{ __('Current Quantity: ') }}</span>
          {{ popupData.current_qty }}
        </div>

        <FormControl
          v-model="popupData.wastage_qty"
          :label="__('Wastage Quantity')"
          type="number"
          class="mb-4"
        />

        <FormControl
          v-model="popupData.item_warehouse"
          :label="__('Warehouse')"
          class="mb-4"
        />

        <div class="flex justify-end">
          <Button @click="submitPopup" variant="solid" class="mr-2">
            {{ __('Add') }}
          </Button>
          <Button @click="closePopup" variant="outlined">
            {{ __('Cancel') }}
          </Button>
        </div>
      </div>
    </div>

    <!-- Success Message -->
    <div
      v-if="successMessage"
      class="fixed bottom-5 right-5 p-4 bg-green-500 text-white rounded-lg"
    >
      {{ successMessage }}
    </div>
  </div>
</template>

  
<script setup>
import { reactive, ref, onMounted, computed } from 'vue'
import { createResource } from 'frappe-ui'
import { showToast as displayToast } from '../../utils'

// Function to get today's date in YYYY-MM-DD format
const getTodayDate = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Reactive state for stock reconciliation data
const reconciliationData = reactive({
  posting_date: getTodayDate(),
  posting_time: '00:00',
  warehouse: '',
  purpose: 'Stock Reconciliation',
  items: [],
})
const searchItemGroup=ref([])
// Reactive state for current tab
const currentTab = ref('itemDetails')
const navigationItems=ref([])
// Reactive state for item details
const itemDetails = ref([])

// Reactive state for search query
const searchQuery = ref('')

// Reactive state for popup
const showPopup = ref(false)
const popupData = reactive({
  qty: 0,
  wastage_qty: 0, 
  item_warehouse: '',
})

// Resource for fetching item details
const itemDetailsResource = createResource({
  url: 'tqerp_horticorp.tqerp_horticorp.utils.get_item_details',
  cache: ['itemDetails'],
  auto: true,
})

// Resource for fetching warehouse details
const warehouseResource = createResource({
  url: 'tqerp_horticorp.tqerp_horticorp.utils.get_warehouse_details',
  auto: true,
  cache: ['warehouseDetails'],
})

// Fetch item details and warehouse details on component mount
onMounted(async () => {
  try {
    const items = await itemDetailsResource.fetch()

    // Load existing quantities from localStorage if available
    const storedQuantities = JSON.parse(localStorage.getItem('updatedItemQuantities')) || []

    // Assuming items is an array of item objects with actual_qty from the response
    itemDetails.value = items.map(item => {
      const storedItem = storedQuantities.find(i => i.item_code === item.item_code)
      return {
        item_name: item.item_name,
        item_code: item.item_code,
        actual_qty: storedItem ? storedItem.qty : item.actual_qty, // Use stored qty if exists
        original_qty: item.actual_qty, // Keep track of the original quantity
      }
    })

    // Fetch warehouse details
    const warehouseData = await warehouseResource.fetch()
    reconciliationData.warehouse = warehouseData.warehouse
  } catch (error) {
    console.error("Error fetching item or warehouse details:", error)
    displayToast('Error fetching details', 'error')
  }
})

// Computed property to filter items based on search query
const filteredItems = computed(() => {
  if (!searchQuery.value) {
    return itemDetails.value
  }
  return itemDetails.value.filter(item =>
    item.item_name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    item.item_code.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// Resource for saving stock reconciliation
const saveResource = createResource({
  url: 'frappe.client.insert',
  method: 'POST',
  makeParams() {
    return {
      doc: {
        doctype: 'Stock Reconciliation',
        posting_date: reconciliationData.posting_date,
        posting_time: reconciliationData.posting_time,
        warehouse: reconciliationData.warehouse,
        purpose: reconciliationData.purpose,
        items: reconciliationData.items,
      },
    }
  },
  successMessage: 'Stock Reconciliation saved successfully!',
})

// Save the stock reconciliation data
const saveStock = async () => {
  try {
    await saveResource.fetch(); // Save the reconciliation data

    // Update the current_qty in itemDetails to reflect the remaining quantity after wastage
    reconciliationData.items.forEach(item => {
      const index = itemDetails.value.findIndex(i => i.item_code === item.item_code)
      if (index !== -1) {
        const originalQty = itemDetails.value[index].actual_qty // Assuming this holds the original qty
        const updatedQty = originalQty - item.wastage_qty // Calculate updated quantity after wastage
        itemDetails.value[index].actual_qty = updatedQty // Update actual_qty in itemDetails
        console.log(`Updated actual_qty for ${item.item_code}: ${updatedQty}`)
      }
    })

    reconciliationData.items = [] // Clear items after saving
    displayToast('Stock Updated successfully!', 'success')
  } catch (error) {
    console.error("Error saving stock reconciliation:", error)
    displayToast('Error saving stock reconciliation', 'error')
  }
}

// Open the item popup
const openPopup = async (item) => {
  const existingItem = reconciliationData.items.find(i => i.item_code === item.item_code)

  // If the item already exists, pre-fill the wastage quantity
  if (existingItem) {
    popupData.wastage_qty = existingItem.wastage_qty
  } else {
    popupData.wastage_qty = 0 // Reset wastage quantity if existing
  }

  popupData.item_code = item.item_code
  popupData.item_name = item.item_name
  popupData.current_qty = item.actual_qty // Get actual quantity from the item object
  popupData.item_warehouse = reconciliationData.warehouse // Set warehouse automatically
  showPopup.value = true
}

// Close the item popup
const closePopup = () => {
  showPopup.value = false
}

// Submit the item to the cart
const submitPopup = () => {
  const quantity = popupData.current_qty - popupData.wastage_qty

  // Ensure that quantity is not negative
  if (quantity < 0) {
    displayToast('Wastage quantity cannot exceed current quantity.', 'error')
    return
  }

  // Check if the item already exists in the cart
  const existingItemIndex = reconciliationData.items.findIndex(item => item.item_code === popupData.item_code)

  const newItem = {
    item_code: popupData.item_code,
    qty: quantity, // Set the calculated quantity 
    wastage_qty: popupData.wastage_qty, // Include wastage quantity
    warehouse: popupData.item_warehouse,
  }

  if (existingItemIndex !== -1) {
    // Update the existing item's quantity and wastage_qty
    reconciliationData.items[existingItemIndex] = newItem
  } else {
    // Add new item if it doesn't exist
    reconciliationData.items.push(newItem)
  }

  // Save the updated quantities to localStorage
  localStorage.setItem('updatedItemQuantities', JSON.stringify(reconciliationData.items))

  closePopup()
}

// Remove item from the cart
const removeItem = (index) => {
  reconciliationData.items.splice(index, 1)
}

// Reactive state for success message
const successMessage = ref('')
</script>