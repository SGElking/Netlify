<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2>{{ isLogin ? '登录' : '注册' }}</h2>
      
      <form @submit.prevent="handleSubmit" class="auth-form">
        <div class="form-group">
          <label for="email">邮箱</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            placeholder="请输入邮箱"
          />
        </div>
        
        <div class="form-group">
          <label for="password">密码</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            placeholder="请输入密码"
          />
        </div>
        
        <button type="submit" :disabled="isLoading" class="submit-btn">
          {{ isLoading ? '处理中...' : (isLogin ? '登录' : '注册') }}
        </button>
      </form>
      
      <div class="auth-switch">
        <p>
          {{ isLogin ? '没有账号？' : '已有账号？' }}
          <button @click="toggleMode" class="switch-btn">
            {{ isLogin ? '注册' : '登录' }}
          </button>
        </p>
      </div>
      
      <div v-if="message" class="message" :class="{ error: isError }">
        {{ message }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useAuthStore } from '../stores/auth.js'

const authStore = useAuthStore()
const isLogin = ref(true)
const isLoading = ref(false)
const message = ref('')
const isError = ref(false)

const form = reactive({
  email: '',
  password: ''
})

const toggleMode = () => {
  isLogin.value = !isLogin.value
  message.value = ''
}

const handleSubmit = async () => {
  isLoading.value = true
  message.value = ''
  isError.value = false
  
  try {
    if (isLogin.value) {
      await authStore.signIn(form.email, form.password)
      message.value = '登录成功！'
    } else {
      await authStore.signUp(form.email, form.password)
      message.value = '注册成功！请检查邮箱验证。'
    }
  } catch (error) {
    isError.value = true
    message.value = error.message
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
}

.auth-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: #2c3e50;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

label {
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #555;
}

input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

input:focus {
  outline: none;
  border-color: #3498db;
}

.submit-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-btn:hover:not(:disabled) {
  background: #2980b9;
}

.submit-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.auth-switch {
  text-align: center;
  margin-top: 1rem;
}

.switch-btn {
  background: none;
  border: none;
  color: #3498db;
  cursor: pointer;
  text-decoration: underline;
}

.message {
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 4px;
  text-align: center;
}

.message:not(.error) {
  background: #d4edda;
  color: #155724;
}

.message.error {
  background: #f8d7da;
  color: #721c24;
}
</style>