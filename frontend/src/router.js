import { createRouter, createWebHistory } from 'vue-router'
import { userResource } from '@/stores/user'
import { sessionStore } from '@/stores/session'

const routes = [
  {
    path: '/',
    redirect: { name: 'Tasks' },
    name: 'Home',
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: () => import('@/pages/MobileNotification.vue'),
  },

  
  {
    alias: '/notes',
    path: '/notes/view/:viewType?',
    name: 'Notes',
    component: () => import('@/pages/Notes.vue'),
  },
  {
    alias: '/tasks',
    path: '/tasks/view/:viewType?',
    name: 'Tasks',
    component: () => import('@/pages/Tasks.vue'),
  },
  {
    alias: '/items',
    path: '/items/view/:viewType?',
    name: 'Items',
    component: () => import('@/pages/stock/Items.vue'),
  },
  {
    alias: '/stock',
    path: '/stock/view/:viewType?',
    name: 'Stock',  // Make sure this is a string
    component: () => import('@/pages/stock/Stock.vue'),
    meta: { scrollPos: { top: 0, left: 0 } },
  },
  {
    path: '/create-stock/:courseName',
    name: 'CreateStock',
    component: () => import('@/pages/stock/CreateStock.vue'),
    // component: CreateStockComponent, // replace with actual component
    meta: { scrollPos: { top: 0, left: 0 } },
    // props: true
  },
  {
    alias: '/PriceUpdate',
    path: '/PriceUpdate/view/:viewType?',
    name: 'Price Update', // Ensure this matches exactly
    component: () => import('@/pages/buying/PriceUpdate.vue'),
    meta: { scrollPos: { top: 0, left: 0 } }
  }, 
  {
    path: '/update-price/:courseName',
    name: 'UpdatePrice',
    component: () => import('@/pages/buying/UpdatePrice.vue'),
    meta: { scrollPos: { top: 0, left: 0 } },
    // props: true
  },
  {
    alias: '/Material',
    path: '/Material/view/:viewType?',  // Optional parameter "viewType"
    name: 'Material',  // Unique route name for Material.vue
    component: () => import('@/pages/stock/Material.vue'),
    meta: { scrollPos: { top: 0, left: 0 } }
  },
  {
    path: '/material-request/:courseName?',  // Optional parameter "courseName"
    name: 'MaterialRequest',  // Unique route name for MaterialRequest.vue
    component: () => import('@/pages/stock/MaterialRequest.vue'),
    meta: { scrollPos: { top: 0, left: 0 } },
    props: true
  },
  {
    alias: '/Requirements',  // Alias for DeliveryNote
    path: '/Requirements/view/:viewType?', 
    name: 'Requirements',  
    component: () => import('@/pages/selling/Requirements.vue'),
    meta: { scrollPos: { top: 0, left: 0 } }
  },
  {
    path: '/create-requirement/:courseName?',
    name: 'CreateRequirement',
    component: () => import('@/pages/selling/CreateRequirement.vue'),
    meta: { scrollPos: { top: 0, left: 0 } },
    props: true,  // Pass route params as props to the component (if any)
  },
  {
    alias: '/DeliveryNote',  // Alias for Delivery Note
    path: '/DeliveryNote/view/:viewType?',
    name: 'DeliveryNote', // Unique route name for DeliveryNote.vue
    component: () => import('@/pages/selling/DeliveryNote.vue'),
    meta: { scrollPos: { top: 0, left: 0 } }
  },
  {
    alias: '/MaterialDemandList',
    path: '/MaterialDemandList/view/:viewType?',  // Optional parameter "viewType"
    name: 'MaterialDemandList',  // Unique route name for MaterialList.vue
    component: () => import('@/pages/selling/MaterialDemandList.vue'),
    meta: { scrollPos: { top: 0, left: 0 } }
  },
  {
    path: '/material-demand/:courseName?',  // Optional parameter "courseName"
    name: 'MaterialDemand',  // Unique route name for MaterialRequest.vue
    component: () => import('@/pages/selling/MaterialDemand.vue'),
    meta: { scrollPos: { top: 0, left: 0 } },
    props: true  // Pass route params as props to the component
  },
   {
    path: '/:invalidpath',
    name: 'Invalid Page',
    component: () => import('@/pages/InvalidPage.vue'),
  },
]

const handleMobileView = (componentName) => {
  return window.innerWidth < 768 ? `Mobile${componentName}` : componentName
}

const scrollBehavior = (to, from, savedPosition) => {
  if (to.name === from.name) {
    to.meta?.scrollPos && (to.meta.scrollPos.top = 0)
    return { left: 0, top: 0 }
  }
  const scrollpos = to.meta?.scrollPos || { left: 0, top: 0 }

  if (scrollpos.top > 0) {
    setTimeout(() => {
      let el = document.querySelector('#list-rows')
      el.scrollTo({
        top: scrollpos.top,
        left: scrollpos.left,
        behavior: 'smooth',
      })
    }, 300)
  }
}

let router = createRouter({
  history: createWebHistory('/crm'),
  routes,
  scrollBehavior,
})

router.beforeEach(async (to, from, next) => {
  const { isLoggedIn } = sessionStore()

  isLoggedIn && (await userResource.promise)

  if (from.meta?.scrollPos) {
    from.meta.scrollPos.top = document.querySelector('#list-rows')?.scrollTop
  }

  if (to.name === 'Home' && isLoggedIn) {
    next({ name: 'Tasks' })
  } else if (!isLoggedIn) {
    window.location.href = '/login?redirect-to=/crm'
  } else if (to.matched.length === 0) {
    next({ name: 'Invalid Page' })
  } else {
    next()
  }
})

export default router
