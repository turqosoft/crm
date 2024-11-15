<template>
    <div class="p-4">
      <h2 class="text-lg font-bold mb-4">{{ formTitle }}</h2>
      <form @submit.prevent="submitForm">
        <!-- Request Type Field -->
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1" for="request_type">{{ __('Request Type') }}</label>
          <span id="material_request_type" class="block text-sm p-2">{{ formData.material_request_type }}</span>
        </div>
  
        <!-- Transaction Date Field -->
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1" for="transaction_date">{{ __('Transaction Date') }}</label>
          <span id="transaction_date" class="block text-sm p-2">{{ formData.transaction_date }}</span>
        </div>
  
        <!-- Warehouse Field
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1" for="warehouse">{{ __('Warehouse') }}</label>
          <span id="warehouse" class="block text-sm p-2">{{ formData.defaultWarehouse }}</span>
        </div> -->
  
        <!-- Schedule Date Field -->
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1" for="schedule_date">{{ __('Required By') }}</label>
          <span id="schedule_date" class="block text-sm p-2">{{ formData.schedule_date }}</span>
        </div>
  
        <!-- Items Table -->
        <h3 class="text-md font-semibold mt-4">{{ __('Items') }}</h3>
        <table class="min-w-full border border-gray-300 mt-2">
          <thead>
            <tr>
              <th class="border p-2">{{ __('Item Code') }}</th>
              <th class="border p-2">{{ __('Quantity') }}</th>
              <th class="border p-2">{{ __('Target Warehouse') }}</th>
              <th class="border p-2">{{ __('UOM') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in formData.items" :key="index">
              <td class="border p-2">{{ item.item_code }}</td>
              <td class="border p-2">
                <input v-model.number="item.qty" type="number" min="0" class="border p-1 rounded w-full" />
              </td>
              <td class="border p-2">{{ item.warehouse || 'N/A' }}</td>
              <td class="border p-2">{{ item.uom || 'N/A' }}</td>
            </tr>
            <tr v-if="!formData.items.length">
              <td colspan="4" class="border p-2 text-center text-gray-500">{{ __('No items found') }}</td>
            </tr>
          </tbody>
        </table>
  
        <!-- Submit and Close Buttons -->
        <div class="mt-4 flex justify-between">
          <!-- <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded">
            {{ __('Update') }}
          </button> -->
          <button type="button" @click="closeForm" class="bg-gray-300 text-gray-800 px-4 py-2 rounded ml-auto">
            {{ __('Close') }}
          </button>
        </div>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  
  const props = defineProps({
    requirement: Object
  });
  
  // Emit events for update and close actions
  const emit = defineEmits(['update', 'close']);
  
  // Initialize formData with requirement data
  const formData = ref({
    ...props.requirement,
    items: (props.requirement.items || []).map(item => ({
      ...item,
      qty: item.qty || 0,
      target_warehouse: item.warehouse || '',
      uom: item.uom || ''
    }))
  });
  
  // Emit form data on submission
  const submitForm = () => {
    const updatedItems = formData.value.items.map(item => ({
      item_code: item.item_code,
      qty: item.qty,
      target_warehouse: item.warehouse,
      uom: item.uom
    }));
  
    // Emit the updated requirement data
    emit('update', {
      id: formData.value.id, // Include ID or other unique identifier if needed
      name: formData.value.name,
      request_type: formData.value.request_type,
      transaction_date: formData.value.transaction_date,
      warehouse: formData.value.defaultWarehouse,
      schedule_date: formData.value.schedule_date,
      items: updatedItems
    });
  };
  
  // Close the form and emit a close event
  const closeForm = () => {
    emit('close'); // This will trigger the close event
  };
  
  // Computed title for the form
  const formTitle = computed(() => `Details for ${formData.value.name || ''}`);
  </script>
  
  <style scoped>
  /* Add styles specific to RequirementForm if needed */
  </style>