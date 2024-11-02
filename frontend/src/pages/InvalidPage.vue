<template>
  <div
    class="grid h-full place-items-center px-4 py-20 text-center text-lg text-gray-600"
  >
    <div class="space-y-2">
      <div>Invalid page or not permitted to access</div>
      <Button :route="{ name: 'Tasks' }">
        <template #prefix><TaskIcon class="w-4" /></template>
        Tasks
      </Button>
    </div>
  </div>
</template>


<script setup>
import TaskIcon from '@/components/Icons/TaskIcon.vue'
</script>
