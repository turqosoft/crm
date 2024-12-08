<template>
  <div class="p-6 max-w-4xl mx-auto">
    <h2 class="text-2xl font-bold mb-6 text-center">{{ formTitle }}</h2>

    <form @submit.prevent="submitForm" class="space-y-6">
      <!-- Delivery Note Name -->
      <div class="mb-4">
        <label class="block text-sm font-medium mb-2" for="name">{{ __('Delivery Note Name') }}</label>
        <input id="name" v-model="formData.name" type="text" class="border p-3 w-full rounded" readonly />
      </div>

      <!-- Customer Details -->
      <div class="mb-4">
        <label class="block text-sm font-medium mb-2" for="customer">{{ __('Customer') }}</label>
        <input id="customer" v-model="formData.customer" type="text" class="border p-3 w-full rounded" readonly />
      </div>

      <!-- Delivery Details -->
      <div class="mb-4">
        <label class="block text-sm font-medium mb-2" for="posting_date">{{ __('Delivery Date') }}</label>
        <input id="posting_date" v-model="formData.posting_date" type="text" class="border p-3 w-full rounded" readonly />
      </div>

      <!-- Items Table -->
      <h3 class="text-xl font-semibold mt-6">{{ __('Items') }}</h3>
      <div class="overflow-x-auto">
        <table class="min-w-full border border-gray-300 mt-2">
          <thead>
            <tr>
              <th class="border p-3 text-left">{{ __('Item Name') }}</th>
              <th class="border p-3 text-left">{{ __('Item Code') }}</th>
              <th class="border p-3 text-left">{{ __('Quantity') }}</th>
              <th class="border p-3 text-left">{{ __('Rate') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in formData.items" :key="index">
              <td class="border p-3">{{ item.item_name }}</td>
              <td class="border p-3">{{ item.item_code }}</td>
              <td class="border p-3">
                <input v-model.number="item.qty" type="number" class="border p-2 rounded w-full" />
              </td>
              <td class="border p-3">
                <input v-model.number="item.rate" type="number" class="border p-2 rounded w-full" />
              </td>
            </tr>
            <tr v-if="!formData.items.length">
              <td colspan="4" class="border p-3 text-center text-gray-500">{{ __('No items found') }}</td>
            </tr>
          </tbody>
        </table>
      </div>


      <!-- Submit/Close Buttons -->
      <div class="mt-6 flex justify-between items-center">
        <!-- Update Button -->
        <button :disabled="!isUpdateEnabled || createdReturnNote" @click="submitForm" class="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 focus:outline-none disabled:opacity-50">
          Update
        </button>

        <!-- Close Button -->
        <button type="button" @click="closeForm" class="bg-gray-300 text-gray-800 px-6 py-2 rounded hover:bg-gray-400 focus:outline-none">
          {{ __('Close') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  deliveryNote: Object
});

const emit = defineEmits(['update', 'close']);

// Define formData with default values
const formData = ref({
  ...props.deliveryNote,
  status: props.deliveryNote.status || '', // Ensure status is passed
  noteType: props.deliveryNote.is_return && props.deliveryNote.return_against ? 'Sales Return' : 'Delivery Note', // Determine noteType based on the return fields
  items: Array.isArray(props.deliveryNote.items) ? props.deliveryNote.items.map(item => ({
    ...item,
    qty: item.qty,
    rate: item.rate
  })) : [] // Default to an empty array if not available
});

// Track whether a return note has already been created
const createdReturnNote = ref(false);

// Compute the form title
const formTitle = computed(() => formData.value.name || 'Delivery Note');

// Compute if the Update button should be enabled based on the note type and status
const isUpdateEnabled = computed(() => {
  return (formData.value.noteType === 'Delivery Note') || 
         (formData.value.noteType === 'Sales Return' && formData.value.status === 'Draft');
});

// Submit the form
const submitForm = () => {
  // Prevent submitting if a return note has already been created
  if (createdReturnNote.value) {
    alert('A return note has already been created.');
    return;
  }

  const updatedItems = formData.value.items.map(item => ({
    item_name: item.item_name,
    item_code: item.item_code,
    qty: item.qty,
    rate: item.rate
  }));

  // Mark return note as created after submission
  createdReturnNote.value = true;

  emit('update', {
    id: formData.value.id,
    customer: formData.value.customer,
    delivery_date: formData.value.posting_date,
    items: updatedItems
  });
};

// Close the form
const closeForm = () => {
  emit('close');
};
</script>