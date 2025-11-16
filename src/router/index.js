import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

// 路由组件 - 直接导入
import AuthPage from '../views/AuthPage.vue'
import DashboardPage from '../views/DashboardPage.vue'
import ProjectDetailPage from '../views/ProjectDetailPage.vue'

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
  
  try {
    // 初始化认证状态
    await authStore.initAuth()
    
    // 等待认证状态稳定
    await new Promise(resolve => setTimeout(resolve, 100))
    
    if (to.meta.requiresAuth && !authStore.user) {
      next('/auth')
    } else if (to.path === '/auth' && authStore.user) {
      next('/dashboard')
    } else {
      next()
    }
  } catch (error) {
    console.error('路由守卫错误:', error)
    next('/auth')
  }
})

export default router