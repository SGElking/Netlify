<template>
  <div class="dashboard">
    <div class="header">
      <h1>我的项目</h1>
      <button @click="showCreateForm = true" class="create-btn">创建新项目</button>
    </div>

    <!-- 创建项目表单 -->
    <div v-if="showCreateForm" class="modal">
      <div class="modal-content">
        <h3>创建新项目</h3>
        <form @submit.prevent="createProject" class="project-form">
          <div class="form-group">
            <label for="projectName">项目名称</label>
            <input
              id="projectName"
              v-model="newProject.name"
              type="text"
              required
              placeholder="输入项目名称"
            />
          </div>
          
          <div class="form-group">
            <label for="projectDescription">项目描述</label>
            <textarea
              id="projectDescription"
              v-model="newProject.description"
              placeholder="输入项目描述"
              rows="3"
            ></textarea>
          </div>
          
          <div class="form-actions">
            <button type="button" @click="showCreateForm = false" class="cancel-btn">取消</button>
            <button type="submit" :disabled="isCreating" class="submit-btn">
              {{ isCreating ? '创建中...' : '创建' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 项目列表 -->
    <div v-if="isLoading" class="loading">加载中...</div>
    
    <div v-else-if="projects.length === 0" class="empty-state">
      <p>还没有项目，点击"创建新项目"开始吧！</p>
    </div>
    
    <div v-else class="projects-grid">
      <div
        v-for="project in projects"
        :key="project.id"
        class="project-card"
        @click="$router.push(`/projects/${project.id}`)"
      >
        <h3>{{ project.name }}</h3>
        <p class="description">{{ project.description || '暂无描述' }}</p>
        <div class="project-meta">
          <span>创建时间: {{ formatDate(project.created_at) }}</span>
        </div>
      </div>
    </div>

    <!-- 消息提示 -->
    <div v-if="message" class="message" :class="{ error: isError }">
      {{ message }}
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { supabase } from '../supabase.js'
import { useAuthStore } from '../stores/auth.js'

const projects = ref([])
const isLoading = ref(false)
const showCreateForm = ref(false)
const isCreating = ref(false)
const message = ref('')
const isError = ref(false)

const newProject = reactive({
  name: '',
  description: ''
})

// 获取项目列表
const fetchProjects = async () => {
  isLoading.value = true
  try {
    const authStore = useAuthStore()
    if (!authStore.user) {
      throw new Error('用户未登录')
    }
    
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', authStore.user.id)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    projects.value = data || []
  } catch (error) {
    console.error('获取项目失败:', error)
    isError.value = true
    message.value = '获取项目失败: ' + error.message
  } finally {
    isLoading.value = false
  }
}

// 创建项目
const createProject = async () => {
  isCreating.value = true
  try {
    const authStore = useAuthStore()
    if (!authStore.user) {
      throw new Error('用户未登录')
    }
    
    // 确保用户profile存在（即使创建失败也继续）
    if (!authStore.profile) {
      await authStore.fetchUserProfile(authStore.user.id)
    }
    
    const { data, error } = await supabase
      .from('projects')
      .insert([{
        user_id: authStore.user.id, // profiles.id 与 auth.users.id 相同
        title: newProject.name,
        description: newProject.description
      }])
      .select()
    
    if (error) {
      // 如果是RLS策略错误，提供解决方案
      if (error.message.includes('row-level security') || error.message.includes('RLS')) {
        throw new Error('数据库权限限制。请在Supabase中为projects表设置适当的RLS策略，或暂时禁用RLS进行测试。')
      }
      throw error
    }
    
    // 添加到项目列表
    projects.value.unshift(data[0])
    
    // 重置表单
    newProject.name = ''
    newProject.description = ''
    showCreateForm.value = false
    
    message.value = '项目创建成功！'
    isError.value = false
  } catch (error) {
    console.error('创建项目失败:', error)
    isError.value = true
    
    // 提供更详细的错误信息
    if (error.message.includes('foreign key constraint')) {
      message.value = '创建项目失败: 用户资料不存在。请确保数据库中的profiles表已正确创建。解决方案：1) 执行SQL创建表 2) 重新注册用户 3) 检查RLS策略'
    } else {
      message.value = '创建项目失败: ' + error.message
    }
  } finally {
    isCreating.value = false
  }
}

// 格式化日期
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

onMounted(() => {
  fetchProjects()
})
</script>

<style scoped>
.dashboard {
  max-width: 1000px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.create-btn {
  background: #27ae60;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
}

.create-btn:hover {
  background: #229954;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
}

.project-form {
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
}

input, textarea {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.cancel-btn {
  background: #95a5a6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
}

.submit-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
}

.submit-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.loading, .empty-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.project-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.project-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.project-card h3 {
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.description {
  color: #666;
  margin-bottom: 1rem;
  line-height: 1.4;
}

.project-meta {
  font-size: 0.9rem;
  color: #999;
}

.message {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 1rem;
  border-radius: 4px;
  z-index: 1001;
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