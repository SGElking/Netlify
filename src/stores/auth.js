import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../supabase.js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isLoading = ref(false)

  // 初始化用户状态
  const initAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    user.value = session?.user || null
  }

  // 监听认证状态变化
  supabase.auth.onAuthStateChange((event, session) => {
    user.value = session?.user || null
  })

  // 登录
  const signIn = async (email, password) => {
    isLoading.value = true
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) throw error
      return data
    } finally {
      isLoading.value = false
    }
  }

  // 注册
  const signUp = async (email, password) => {
    isLoading.value = true
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })
      if (error) throw error
      return data
    } finally {
      isLoading.value = false
    }
  }

  // 登出
  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return {
    user,
    isLoading,
    initAuth,
    signIn,
    signUp,
    signOut
  }
})