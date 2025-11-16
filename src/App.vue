<template>
  <div id="app">
    <nav v-if="user" class="navbar">
      <div class="nav-container">
        <h1>项目管理</h1>
        <div class="nav-links">
          <router-link to="/dashboard">仪表板</router-link>
          <button @click="handleSignOut" class="logout-btn">退出登录</button>
        </div>
      </div>
    </nav>
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from './stores/auth.js'

const authStore = useAuthStore()
const user = computed(() => authStore.user)

const handleSignOut = async () => {
  try {
    await authStore.signOut()
  } catch (error) {
    console.error('退出登录失败:', error.message)
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f5f5f5;
}

.navbar {
  background: #2c3e50;
  color: white;
  padding: 1rem 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
}

.nav-links {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.nav-links a {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.nav-links a:hover {
  background-color: rgba(255,255,255,0.1);
}

.logout-btn {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.logout-btn:hover {
  background: #c0392b;
}

main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}
</style>