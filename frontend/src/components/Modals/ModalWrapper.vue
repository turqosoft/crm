<template>
    <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
        <header class="flex justify-between items-center border-b pb-2 mb-4">
          <h2 class="text-xl font-bold">{{ title }}</h2>
          <!-- Removed the close button from the header -->
        </header>
        <main>
          <slot></slot>
        </main>
      </div>
    </div>
  </template>
  
  <script setup>
  import { defineProps } from 'vue';
  
  const props = defineProps({
    isOpen: Boolean,
    title: String
  });
  </script>
  
  <style scoped>
  /* Add styles for modal background and container if needed */
  </style>