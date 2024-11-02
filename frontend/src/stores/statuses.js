import IndicatorIcon from '@/components/Icons/IndicatorIcon.vue'
import { capture } from '@/telemetry'
import { defineStore } from 'pinia'
import { createListResource } from 'frappe-ui'
import { reactive, h } from 'vue'

export const statusesStore = defineStore('crm-statuses', () => {

  let communicationStatusesByName = reactive({})



  const communicationStatuses = createListResource({
    doctype: 'CRM Communication Status',
    fields: ['name'],
    cache: 'communication-statuses',
    initialData: [],
    auto: true,
    transform(statuses) {
      for (let status of statuses) {
        communicationStatusesByName[status.name] = status
      }
      return statuses
    },
  })

  function colorClasses(color, onlyIcon = false) {
    let textColor = `!text-${color}-600`
    if (color == 'black') {
      textColor = '!text-gray-900'
    } else if (['gray', 'green'].includes(color)) {
      textColor = `!text-${color}-700`
    }

    let bgColor = `!bg-${color}-100 hover:!bg-${color}-200 active:!bg-${color}-300`

    return [textColor, onlyIcon ? '' : bgColor]
  }





  function getCommunicationStatus(name) {
    if (!name) {
      name = communicationStatuses.data[0].name
    }
    return communicationStatuses[name]
  }

  function statusOptions(doctype, action, statuses = []) {
    let statusesByName =
      doctype == 'deal' ? dealStatusesByName : leadStatusesByName

    if (statuses.length) {
      statusesByName = statuses.reduce((acc, status) => {
        acc[status] = statusesByName[status]
        return acc
      }, {})
    }

    let options = []
    for (const status in statusesByName) {
      options.push({
        label: statusesByName[status]?.name,
        value: statusesByName[status]?.name,
        icon: () =>
          h(IndicatorIcon, {
            class: statusesByName[status]?.iconColorClass,
          }),
        onClick: () => {
          capture('status_changed', { doctype, status })
          action && action('status', statusesByName[status]?.name)
        },
      })
    }
    return options
  }

  return {

    communicationStatuses,

    getCommunicationStatus,
    statusOptions,
  }
})
