<template>
  <LayoutHeader>
    <template #left-header>
      <ViewBreadcrumbs v-model="viewControls" routeName="Items" />
    </template>
    <template #right-header>
    </template>
  </LayoutHeader>
  <ViewControls
    ref="viewControls"
    v-model="items"
    v-model:loadMore="loadMore"
    v-model:resizeColumn="triggerResize"
    v-model:updatedPageCount="updatedPageCount"
    doctype="Item"
    :options="{
      allowedViews: ['list'],
    }"
  />
  
  <ItemsListView
    ref="itemsListView"
    v-if="items.data && rows.length"
    v-model="items.data.page_length_count"
    v-model:list="items"
    :rows="rows"
    :columns="items.data.columns"
    :options="{
      showTooltip: false,
      resizeColumn: true,
      rowCount: items.data.row_count,
      totalCount: items.data.total_count,
    }"
    @loadMore="() => loadMore++"
    @columnWidthUpdated="() => triggerResize++"
    @updatePageCount="(count) => (updatedPageCount = count)"
    @showItem="showItem"
    @applyFilter="(data) => viewControls.applyFilter(data)"
    @applyLikeFilter="(data) => viewControls.applyLikeFilter(data)"
    @likeDoc="(data) => viewControls.likeDoc(data)"
  />
  <div
    v-else
    class="flex h-full items-center justify-center"
  >
    <div
      class="flex flex-col items-center gap-3 text-xl font-medium text-gray-500"
    >
      <Email2Icon class="h-10 w-10" />
      <span>{{ __('No {0} Found', [__('Items')]) }}</span>

    </div>
  </div>
  <ItemModal
    v-if="showItemModal"
    v-model="showItemModal"
    v-model:reloadTasks="items"
    :item="item"
  />
</template>

<script setup>
import ViewBreadcrumbs from '@/components/ViewBreadcrumbs.vue'
import CustomActions from '@/components/CustomActions.vue'
import ArrowUpRightIcon from '@/components/Icons/ArrowUpRightIcon.vue'
import TaskStatusIcon from '@/components/Icons/TaskStatusIcon.vue'
import TaskPriorityIcon from '@/components/Icons/TaskPriorityIcon.vue'
import Email2Icon from '@/components/Icons/Email2Icon.vue'
import LayoutHeader from '@/components/LayoutHeader.vue'
import ViewControls from '@/components/ViewControls.vue'
import ItemsListView from '@/components/ListViews/ItemsListView.vue'

import ItemModal from '@/components/Modals/ItemModal.vue'
import { usersStore } from '@/stores/users'
import { dateFormat, dateTooltipFormat, timeAgo } from '@/utils'
import { Tooltip, Avatar, TextEditor, Dropdown, call } from 'frappe-ui'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const { getUser } = usersStore()

const router = useRouter()

const itemsListView = ref(null)

// items data is loaded in the ViewControls component
const items = ref({})
const loadMore = ref(1)
const triggerResize = ref(1)
const updatedPageCount = ref(20)
const viewControls = ref(null)

function getRow(name, field) {
  function getValue(value) {
    if (value && typeof value === 'object') {
      return value
    }
    return { label: value }
  }
  return getValue(rows.value?.find((row) => row.name == name)[field])
}

const rows = computed(() => {
  if (!items.value?.data?.data) return []
  return parseRows(items.value?.data.data)
})

function parseRows(rows) {
  return rows.map((item) => {
    let _rows = {}
    items.value?.data.rows.forEach((row) => {
      _rows[row] = item[row]

      if (['modified', 'creation'].includes(row)) {
        _rows[row] = {
          label: dateFormat(item[row], dateTooltipFormat),
          timeAgo: __(timeAgo(item[row])),
        }
      }
    })
    return _rows
  })
}

const showItemModal = ref(false)

const item = ref({
  item_code: '',
  item_name: '',
  description: '',
  stock_uom: '',
  gst_hsn_code: '',
  is_stock_item: '',
  disabled: 0,
  item_group: '',
})

function showItem(item_code) {
  let t = rows.value?.find((row) => row.item_code === item_code)
  item.value = {
    item_code: t.item_code,
    item_name: t.item_name,
    item_group: t.item_group,
    description: t.description,
    stock_uom: t.stock_uom,
    gst_hsn_code: t.gst_hsn_code,
    is_stock_item: t.is_stock_item,
  }
  showItemModal.value = true
}



function redirect(doctype, docname) {
  if (!docname) return
  let name = doctype == 'CRM Deal' ? 'Deal' : 'Lead'
  let params = { leadId: docname }
  if (name == 'Deal') {
    params = { dealId: docname }
  }
  router.push({ name: name, params: params })
}
</script>
