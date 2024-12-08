<template>
  <div>
    <!-- Existing Header and Form Controls -->
    <header class="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-3 py-2.5 sm:px-5">
      <!-- <Breadcrumbs class="h-7" :items="breadcrumbs" /> -->
      <Button variant="solid" @click="saveRequirement">
        {{ __('Save') }}
      </Button>
    </header>
    
    <div class="w-full max-w-4xl mx-auto py-5">
      <div class="text-lg font-semibold mb-4 text-center">
        {{ __('Create Requirement') }}
      </div>
      
<!-- Search Field and Button -->
<div class="flex items-center justify-start mb-4">
  <div class="flex-1 max-w-xs ml-12"> <!-- Apply a left margin to shift the field box left -->
    <FormControl
      v-model="searchQuery"
      :label="__('Search Item Group')"
      placeholder="Enter item group name..."
    />
  </div>
  <Button
    variant="outline"
    @click="searchItemGroup"
    class="w-auto ml-2" 
  >
    {{ __('Search') }}
  </Button>
</div>



<!-- Updated Layout for Required By -->
<div class="flex items-center justify-between gap-4 mb-4">
  <div class="flex-1 max-w-xs ml-12 sm:ml-8 md:ml-12"> <!-- Apply consistent left margin for alignment -->
    <FormControl
      v-model="requirementData.schedule_date"
      :label="__('Required By')"
      type="date"
    />
  </div>
</div>






      <!-- Username (Hidden but present in the layout) -->
      <FormControl
        v-show="false"  
        v-model="requirementData.username"
        :label="__('Username')"
        class="flex-1"
        readonly
      />

      <!-- User Types (Hidden but present in the layout) -->
      <FormControl
        v-show="false"  
        v-model="requirementData.user_types"
        :label="__('User Types')"
        class="flex-1"
      />

      <!-- Conditionally show the Customer Info field (Hidden) -->
      <FormControl
        v-show="false"  
        v-if="showCustomerInfo"
        v-model="requirementData.customer_info"
        :label="__('Customer Info')"
        class="mb-4 w-full max-w-xs"
      />

      <!-- Conditionally show the Branch field (Hidden) -->
      <FormControl
        v-show="false" 
        v-if="showBranch"
        v-model="requirementData.branch"
        :label="__('Branch')"
        class="mb-4 w-full max-w-xs"
      />
    </div>

    <!-- Tabs for Item Groups and Cart -->
    <div>
      <div class="border-b mb-4">
        <nav class="flex space-x-4">
          <button
            :class="activeTab === 'items' ? 'border-b-2 border-blue-500' : ''"
            @click="activeTab = 'items'"
            class="py-2 px-3"
          >
            {{ __('Item Groups') }}
          </button>
          <button
            :class="activeTab === 'cart' ? 'border-b-2 border-blue-500' : ''"
            @click="activeTab = 'cart'"
            class="py-2 px-3"
          >
            {{ __('Cart') }}
          </button>
        </nav>
      </div>

      <!-- Item Groups List with Box Styling -->
      <div v-if="activeTab === 'items'" class="grid gap-4 mb-4">
        <div
          v-for="(group, index) in itemGroups"
          :key="index"
          class="border rounded-lg p-4 bg-gray-50 cursor-pointer"
          @click="showPopup(group)"
        >
          <h2 class="text-lg font-semibold mb-2">{{ group.name }}</h2>
          <p class="text-sm text-gray-600">{{ __('UOM:') }} {{ group.uom }}</p>
        </div>
      </div>

      <!-- Cart Section with Editable Rows -->
      <div v-if="activeTab === 'cart'" class="border rounded-lg p-4 bg-gray-50">
        <div v-if="requirementData.items.length === 0" class="text-center text-gray-500">
          {{ __('Your cart is empty') }}
        </div>
        <div v-else>
          <div v-for="(entry, index) in requirementData.items" :key="index" class="border-b border-gray-200 py-2">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="font-semibold">{{ entry.item_group }}</div>
                <FormControl
                  v-model="entry.qty"
                  :label="__('Quantity')"
                  type="number"
                  :readonly="!isEditing"
                  class="mb-2"
                />
                <FormControl
                  v-model="entry.notes"
                  :label="__('Notes')"
                  :readonly="!isEditing"
                  class="mb-2"
                />
              </div>
              <div class="ml-4">
                <Button v-if="!isEditing" variant="outline" @click="editCart">
                  {{ __('Edit') }}
                </Button>
                <Button v-if="isEditing" variant="outline" @click="saveCart">
                  {{ __('Save') }}
                </Button>
                <Button variant="outline" @click="removeItem(index)" class="ml-2">
                  {{ __('Remove') }}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Popup for Item Group Details -->
    <div
      v-if="selectedGroup"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
    >
      <div class="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h3 class="text-xl font-semibold mb-4">{{ selectedGroup.name }}</h3>
        <FormControl
          v-model="popupData.quantity"
          :label="__('Quantity')"
          class="mb-4"
          type="number"
        />
        <FormControl
          v-model="popupData.notes"
          :label="__('Notes')"
          class="mb-4"
        />
        <div class="flex justify-end">
          <Button variant="solid" @click="addToCart">
            {{ __('Add to Cart') }}
          </Button>
          <Button variant="outline" @click="closePopup" class="ml-2">
            {{ __('Close') }}
          </Button>
        </div>
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
</template>


<script setup>
import { reactive, ref, onMounted, computed } from 'vue'
import {
  Breadcrumbs,
  FormControl,
  Button,
  createResource,
} from 'frappe-ui'
import { showToast } from '../../utils'

// Function to get today's date in YYYY-MM-DD format
const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Month is zero-indexed
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Reactive state for requirement data
const requirementData = reactive({
  username: '',
  user_types: '',
  customer_info: '',
  branch: '',
  schedule_date: getTodayDate(), // Set today's date as the default
  items: [], // Child table for items
})

// Reactive state for popup
const selectedGroup = ref(null)
const popupData = reactive({
  quantity: '',
  notes: ''
})
const searchQuery = ref('')

// Item Groups Data (Will be fetched from API)
const itemGroups = ref([])

// Resource for fetching item groups
const itemGroupsResource = createResource({
  url: 'tqerp_horticorp.tqerp_horticorp.utils.get_item_groups',
  cache: ['itemGroups'],
  auto: true, // Auto fetch when component mounts
})

// Resource for fetching user details
const userDetails = createResource({
  url: 'tqerp_horticorp.tqerp_horticorp.utils.get_user_details',
  cache: ['userDetails'],
  auto: true, // Auto fetch when component mounts
})

// Resource for saving the requirements
const saveResource = createResource({
  url: 'frappe.client.insert',
  method: 'POST',
  makeParams() {
    return {
      doc: {
        doctype: 'Material Requirement',
        ...requirementData,
        items: requirementData.items.map(item => ({
          qty: item.qty,
          notes: item.notes,
          item_group: item.item_group, // Ensure item_group is included
        })),
      },
    }
  },
  cache: false, // Do not cache POST requests
})

// Success message ref
const successMessage = ref('')

// Computed properties for conditional display
const showCustomerInfo = computed(() => requirementData.user_types === 'Customer')
const showBranch = computed(() => requirementData.user_types === 'Branch')

// Reactive state for the active tab
const activeTab = ref('items') // Default to 'items' tab

// Reactive state for editing mode
const isEditing = ref(false)

// Fetch item groups
const fetchItemGroups = () => {
  itemGroupsResource.fetch().then(data => {
    itemGroups.value = data.map(group => ({
      ...group,
      uom: group.uom || 'N/A' // Ensure UOM is available or default to 'N/A'
    }))
  }).catch(error => {
    console.error('Error fetching item groups:', error.message || 'Unknown error')
  })
}

// Fetch user details
const fetchUserDetails = () => {
  userDetails.fetch().then(data => {
    requirementData.username = data.username
    requirementData.user_types = data.user_types
    requirementData.customer_info = data.customer_info
    requirementData.branch = data.branch
  }).catch(error => {
    console.error('Error fetching user details:', error.message || 'Unknown error')
  })
}

// Open popup for item group
const showPopup = (group) => {
  selectedGroup.value = group
  popupData.quantity = ''
  popupData.notes = ''
}

// Close popup
const closePopup = () => {
  selectedGroup.value = null
}
// Add item to cart
const addToCart = () => {
  if (popupData.quantity <= 0) { // Check if quantity is negative or zero
    showToast('Quantity cannot be negative or zero', 'error');
    return; // Stop further execution if quantity is invalid
  }

  requirementData.items.push({
    item_group: selectedGroup.value.name,
    qty: popupData.quantity,
    notes: popupData.notes || '' // Ensure notes is not undefined, default to an empty string
  });
  
  closePopup();
  showToast('Item added to cart successfully', 'success'); // Ensure message is defined and correct
};

// Save requirement and display success message
const saveRequirement = () => {
  // Check if the cart is empty
  if (requirementData.items.length === 0) {
    showToast('Cart cannot be empty. Please add items before saving.', 'error');
    return; // Stop further execution if cart is empty
  }

  // Proceed with saving if the cart is not empty
  saveResource.fetch().then(() => {
    successMessage.value = 'Requirement saved successfully';
    showToast('Requirement saved successfully', 'success');
    
    // Automatically hide the success message after 3 seconds
    setTimeout(() => {
      successMessage.value = '';
    }, 3000); // Adjust the timeout duration as needed
    
    // Clear the cart
    requirementData.items = [];
    
    // Optionally reset other form fields if needed
    requirementData.schedule_date = getTodayDate(); // Reset to today's date
    // Reset other fields as needed...
  }).catch(error => {
    showToast('Error saving requirement', 'error');
  });
};


// Edit cart
const editCart = () => {
  isEditing.value = true
}

// Save cart changes
const saveCart = () => {
  isEditing.value = false
  showToast('Cart updated successfully')
}

// Remove item from cart
const removeItem = (index) => {
  requirementData.items.splice(index, 1)
  showToast('Item removed from cart')
}

// Lifecycle hook to fetch data
onMounted(() => {
  fetchItemGroups()
  fetchUserDetails()
})

// Function to fetch all item groups
const fetchAllItemGroups = () => {
  itemGroupsResource.fetch().then(data => {
    itemGroups.value = data.map(group => ({
      ...group,
      uom: group.uom || 'N/A' // Ensure UOM is available or default to 'N/A'
    }))
    showToast('Displaying all item groups', 'info')
  }).catch(error => {
    showToast('Error fetching item groups', 'error')
  })
}

// Search item groups based on the query
const searchItemGroup = () => {
  if (!searchQuery.value.trim()) {
    // If search query is empty or cleared, show all items
    fetchAllItemGroups() // Fetch and reset to all item groups
    return
  }

  // Filter item groups based on the search query
  const filteredGroups = itemGroups.value.filter(group =>
    group.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )

  if (filteredGroups.length === 0) {
    showToast('No matching item groups found. Displaying all items.', 'error')
    fetchAllItemGroups() // Reset to all items if no results are found
  } else {
    itemGroups.value = filteredGroups
    showToast(`${filteredGroups.length} item groups found`, 'success')
  }
}

// To handle clearing the search input
const clearSearch = () => {
  searchQuery.value = ''
  fetchAllItemGroups() // Reset the item groups to show all when search is cleared
}
</script>