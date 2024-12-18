<template>
  <div class="p-4 max-w-sm mx-auto">
    <h2 class="text-lg font-bold mb-4">{{ formTitle }}</h2>
    <form @submit.prevent="submitForm">
      <div class="mb-4">
        <label class="block text-sm font-medium mb-1" for="delivery_status">{{ __('Delivery Status') }}</label>
        <input id="delivery_status" v-model="formData.delivery_status" type="text" class="border p-2 w-full rounded" readonly />
      </div>

      <h3 class="text-md font-semibold mt-4">{{ __('Items') }}</h3>
      <table class="min-w-full border border-gray-300 mt-2">
        <thead>
          <tr>
            <th class="border p-2">{{ __('Item Name') }}</th>
            <th class="border p-2">{{ __('Quantity') }}</th>
            <th class="border p-2">{{ __('Notes') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in formData.items" :key="index">
            <td class="border p-2">{{ item.item_name }}</td>
            <td class="border p-2">
              <input v-model.number="item.qty" type="number" class="border p-1 rounded w-full" />
            </td>
            <td class="border p-2">{{ item.notes }}</td>
          </tr>
          <tr v-if="!formData.items.length">
            <td colspan="3" class="border p-2 text-center text-gray-500">{{ __('No items found') }}</td>
          </tr>
        </tbody>
      </table>

      <div class="mt-4 flex justify-between">
        <!-- Conditionally show the Update button only if delivery_status is not 'Locked' -->
        <button v-if="formData.document_status !== 'Locked'" type="submit" class="bg-black text-white px-4 py-2 rounded">
          {{ __('Update') }}
        </button>

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
  demand: Object
});

// Emit events for update and close actions
const emit = defineEmits(['update', 'close']);

// Initialize formData with requirement data
const formData = ref({
  ...props.demand,
  items: props.demand.items.map(item => ({
    ...item,
    qty: item.qty || 0 // Ensure qty is initialized
  })) || []
});

// Emit form data on submission
const submitForm = () => {
  const updatedItems = formData.value.items.map(item => ({
    item_name: item.item_name,
    qty: item.qty,
    notes: item.notes
  }));

  // Emit the updated requirement data
  emit('update', {
    id: formData.value.id, // Include ID or other unique identifier if needed
    name: formData.value.name,
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