import { createRouter, createWebHashHistory } from 'vue-router'

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'dashboard', component: () => import('./views/Dashboard.vue') },
    { path: '/observe', name: 'observe', component: () => import('./views/Observe.vue') },
    { path: '/morning', name: 'morning', component: () => import('./views/Morning.vue') },
    { path: '/meditate', name: 'meditate', component: () => import('./views/Meditate.vue') },
    { path: '/heart', name: 'heart', component: () => import('./views/Heart.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ]
})
