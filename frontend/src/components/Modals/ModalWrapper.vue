<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <!-- Centered modal with dynamic height calculated -->
    <div
      class="bg-white p-6 rounded-lg shadow-lg max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg w-full mx-4 overflow-y-auto"
      :style="{ maxHeight: maxHeight }"
    >
      <header class="flex justify-between items-center border-b pb-2 mb-4">
        <h2 class="text-xl font-bold">{{ title }}</h2>
        <!-- Removed the close button from the header -->
      </header>
      <main>
        <slot></slot>
      </main>
      <!-- Add bottom padding for a minimal gap -->
      <div class="h-4"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';

// Props
const props = defineProps({
  isOpen: Boolean,
  title: String
});

// State for dynamic maxHeight
const maxHeight = ref('calc(100vh - 4cm)');

// Function to calculate and update maxHeight
const updateMaxHeight = () => {
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const padding = 80; // 2 cm in pixels
  maxHeight.value = `calc(${viewportHeight}px - ${padding * 2}px)`;
};

// Watch for window resize to recalculate
onMounted(() => {
  updateMaxHeight();
  window.addEventListener('resize', updateMaxHeight);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateMaxHeight);
});
</script>

<style scoped>
/* Optional: Add more specific styles for modal if needed */
</style>