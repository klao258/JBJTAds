import { createRouter, createWebHistory } from 'vue-router'
import { HomeOutline, InformationCircleOutline } from '@vicons/ionicons5'

export const routes = [{
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '今日概览', icon: HomeOutline }
  }, {
    path: '/about',
    name: 'About',
    component: () => import('@/views/About.vue'),
    meta: { title: '关于我们', icon: InformationCircleOutline }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
