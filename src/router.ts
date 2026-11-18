import { createRouter, createWebHashHistory } from 'vue-router'

export const router = createRouter({
  // Hash history: deep links and reloads work on GitHub Pages without server fallbacks.
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: () => import('./views/HomeView.vue') },
    { path: '/product/:id', name: 'product', component: () => import('./views/ProductView.vue') },
    { path: '/cart', name: 'cart', component: () => import('./views/CartView.vue') },
    { path: '/order/:ref', name: 'order', component: () => import('./views/OrderView.vue') },
    { path: '/admin', name: 'admin', component: () => import('./views/AdminView.vue') },
    { path: '/privacy', name: 'privacy', component: () => import('./views/PrivacyView.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior: (to) => (to.hash ? { el: to.hash, behavior: 'smooth' } : { top: 0 }),
})
