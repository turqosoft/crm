<template>
    <div class="p-4">
      <h2 class="text-lg font-bold mb-4">{{ formTitle }}</h2>
      <form @submit.prevent="preventSubmit">
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1" for="posting_date">{{ __('Posting Date') }}</label>
          <input
            id="posting_date"
            v-model="formData.posting_date"
            type="date"
            class="border p-2 w-full rounded"
            readonly
          />
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1" for="posting_time">{{ __('Posting Time') }}</label>
          <input
            id="posting_time"
            v-model="formData.posting_time"
            type="time"
            class="border p-2 w-full rounded"
            readonly
          />
        </div>
  
        <h3 class="text-md font-semibold mt-4">{{ __('Stock Details') }}</h3>
        <table class="min-w-full border border-gray-300 mt-2">
          <thead>
            <tr>
              <th class="border p-2">{{ __('Item Name') }}</th>
              <th class="border p-2">{{ __('Quantity') }}</th>
              <th class="border p-2">{{ __('Wastage Quantity') }}</th>
              <th class="border p-2">{{ __('Warehouse') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in formData.items" :key="index">
              <td class="border p-2">
                <input
                  v-model="item.item_name"
                  type="text"
                  class="border p-1 rounded w-full"
                  readonly
                />
              </td>
              <td class="border p-2">
                <input
                  v-model.number="item.qty"
                  type="number"
                  class="border p-1 rounded w-full"
                  readonly
                />
              </td>
              <td class="border p-2">
                <input
                  v-model.number="item.wastage_qty"
                  type="number"
                  class="border p-1 rounded w-full"
                  readonly
                />
              </td>
              <td class="border p-2">
                <input
                  v-model="item.warehouse"
                  type="text"
                  class="border p-1 rounded w-full"
                  readonly
                />
              </td>
            </tr>
            <tr v-if="!formData.items.length">
              <td colspan="4" class="border p-2 text-center text-gray-500">{{ __('No items found') }}</td>
            </tr>
          </tbody>
        </table>
  
        <div class="mt-4 flex justify-end">
          <button type="button" @click="closeForm" class="bg-gray-300 text-gray-800 px-4 py-2 rounded">
            {{ __('Close') }}
          </button>
        </div>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  
  const props = defineProps({
    stock: {
      type: Object,
      default: () => ({
        items: [],
        posting_date: '',
        posting_time: '',
        warehouse: '',
      }),
    },
  });
  
  // Emit events for close action
  const emit = defineEmits(['close']);
  
  // Initialize formData with stock data
  const formData = ref({
    posting_date: props.stock.posting_date || '',
    posting_time: props.stock.posting_time || '',
    warehouse: props.stock.warehouse || '',
    items: props.stock.items.map(item => ({
      ...item,
      qty: item.qty || 0, // Ensure qty is initialized
      wastage_qty: item.wastage_qty || 0, // Ensure wastage quantity is initialized
    })) || []
  });
  
  // Prevent form submission as it's not needed
  const preventSubmit = () => {};
  
  // Close the form and emit a close event
  const closeForm = () => {
    emit('close'); // This will trigger the close event
  };
  
  // Computed title for the form
  const formTitle = computed(() => `Stock Details ${formData.value.warehouse ? `at ${formData.value.warehouse}` : ''}`);
  </script>
  
  <style scoped>
  /* Add styles specific to StockForm if needed */
  </style>