<template>




    <div class="p-4">
      <header class="sticky top-0 z-10 flex items-center justify-between border-b bg-white shadow-sm px-4 py-3">

        <div class="flex space-x-2 justify-end">
          <router-link
            :to="{
              name: 'UpdatePrice',
              params: {
                courseName: 'new',
              },
            }"
          >
            <Button variant="solid" class="bg-black-600 text-white hover:bg-black-700">
              <template #prefix>
                <Plus class="h-4 w-4" />
              </template>
              {{ __('Update price') }}
            </Button>
          </router-link>
        </div>
      </header>
    </div>
  </template>
  
  <script setup>
  import ViewBreadcrumbs from '@/components/ViewBreadcrumbs.vue'
  import LayoutHeader from '@/components/LayoutHeader.vue'
  import { Button } from 'frappe-ui';
  import { Plus } from 'lucide-vue-next';
  </script>