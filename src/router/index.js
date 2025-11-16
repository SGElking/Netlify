import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

// 路由组件
const AuthPage = () => import('../views/AuthPage.vue')
const DashboardPage = () => import('../views/DashboardPage.vue')
const ProjectDetailPage = () => import('../views/ProjectDetailPage.vue')

const routes = [
  {
    path: '/auth',
    name: 'auth',
    component: AuthPage
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/projects/:id',
    name: 'project-detail',
    component: ProjectDetailPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/',
    redirect: '/dashboard'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // 初始化认证状态
  await authStore.initAuth()
  
  if (to.meta.requiresAuth && !authStore.user) {
    next('/auth')
  } else if (to.path === '/auth' && authStore.user) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router