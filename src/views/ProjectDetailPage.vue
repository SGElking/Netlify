<template>
  <div class="project-detail">
    <!-- 项目信息 -->
    <div v-if="project" class="project-header">
      <div class="header-content">
        <h1>{{ project.name }}</h1>
        <p class="project-description">{{ project.description || '暂无描述' }}</p>
        <div class="project-meta">
          <span>创建时间: {{ formatDate(project.created_at) }}</span>
        </div>
      </div>
    </div>

    <!-- 任务管理区域 -->
    <div class="tasks-section">
      <div class="tasks-header">
        <h2>任务管理</h2>
        <button @click="showTaskForm = true" class="create-task-btn">添加任务</button>
      </div>

      <!-- 创建任务表单 -->
      <div v-if="showTaskForm" class="task-form-container">
        <form @submit.prevent="createTask" class="task-form">
          <div class="form-group">
            <label for="taskTitle">任务标题</label>
            <input
              id="taskTitle"
              v-model="newTask.title"
              type="text"
              required
              placeholder="输入任务标题"
            />
          </div>
          
          <div class="form-group">
            <label for="taskDescription">任务描述</label>
            <textarea
              id="taskDescription"
              v-model="newTask.description"
              placeholder="输入任务描述"
              rows="3"
            ></textarea>
          </div>
          
          <div class="form-group">
            <label for="taskStatus">状态</label>
            <select id="taskStatus" v-model="newTask.status">
              <option value="pending">待处理</option>
              <option value="in-progress">进行中</option>
              <option value="completed">已完成</option>
            </select>
          </div>
          
          <div class="form-actions">
            <button type="button" @click="cancelTask" class="cancel-btn">取消</button>
            <button type="submit" :disabled="isCreatingTask" class="submit-btn">
              {{ isCreatingTask ? '创建中...' : '创建任务' }}
            </button>
          </div>
        </form>
      </div>

      <!-- 任务列表 -->
      <div v-if="isLoadingTasks" class="loading">加载任务中...</div>
      
      <div v-else-if="tasks.length === 0" class="empty-state">
        <p>还没有任务，点击"添加任务"开始吧！</p>
      </div>
      
      <div v-else class="tasks-list">
        <div
          v-for="task in tasks"
          :key="task.id"
          class="task-item"
          :class="getStatusClass(task.status)"
        >
          <div class="task-content">
            <div class="task-header">
              <h3>{{ task.title }}</h3>
              <div class="task-actions">
                <button @click="editTask(task)" class="edit-btn">编辑</button>
                <button @click="deleteTask(task.id)" class="delete-btn">删除</button>
              </div>
            </div>
            
            <p class="task-description">{{ task.description || '暂无描述' }}</p>
            
            <div class="task-footer">
              <span class="task-status" :class="getStatusClass(task.status)">
                {{ getStatusText(task.status) }}
              </span>
              <span class="task-date">{{ formatDate(task.created_at) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 编辑任务模态框 -->
      <div v-if="editingTask" class="modal">
        <div class="modal-content">
          <h3>编辑任务</h3>
          <form @submit.prevent="updateTask" class="task-form">
            <div class="form-group">
              <label for="editTaskTitle">任务标题</label>
              <input
                id="editTaskTitle"
                v-model="editingTask.title"
                type="text"
                required
              />
            </div>
            
            <div class="form-group">
              <label for="editTaskDescription">任务描述</label>
              <textarea
                id="editTaskDescription"
                v-model="editingTask.description"
                rows="3"
              ></textarea>
            </div>
            
            <div class="form-group">
              <label for="editTaskStatus">状态</label>
              <select id="editTaskStatus" v-model="editingTask.status">
                <option value="pending">待处理</option>
                <option value="in-progress">进行中</option>
                <option value="completed">已完成</option>
              </select>
            </div>
            
            <div class="form-actions">
              <button type="button" @click="cancelEdit" class="cancel-btn">取消</button>
              <button type="submit" :disabled="isUpdatingTask" class="submit-btn">
                {{ isUpdatingTask ? '更新中...' : '更新任务' }}
              </button>
            </div>
          </form>
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
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../supabase.js'

const route = useRoute()
const projectId = computed(() => route.params.id)

const project = ref(null)
const tasks = ref([])
const isLoadingTasks = ref(false)
const showTaskForm = ref(false)
const isCreatingTask = ref(false)
const isUpdatingTask = ref(false)
const editingTask = ref(null)
const message = ref('')
const isError = ref(false)

const newTask = reactive({
  title: '',
  description: '',
  status: 'pending'
})

// 获取项目详情
const fetchProject = async () => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId.value)
      .single()
    
    if (error) throw error
    project.value = data
  } catch (error) {
    console.error('获取项目详情失败:', error)
    isError.value = true
    message.value = '获取项目详情失败: ' + error.message
  }
}

// 获取任务列表
const fetchTasks = async () => {
  isLoadingTasks.value = true
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId.value)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    tasks.value = data || []
  } catch (error) {
    console.error('获取任务失败:', error)
    isError.value = true
    message.value = '获取任务失败: ' + error.message
  } finally {
    isLoadingTasks.value = false
  }
}

// 创建任务
const createTask = async () => {
  isCreatingTask.value = true
  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        project_id: projectId.value,
        title: newTask.title,
        description: newTask.description,
        status: newTask.status
      }])
      .select()
    
    if (error) throw error
    
    // 添加到任务列表
    tasks.value.unshift(data[0])
    
    // 重置表单
    Object.assign(newTask, {
      title: '',
      description: '',
      status: 'pending'
    })
    showTaskForm.value = false
    
    message.value = '任务创建成功！'
    isError.value = false
  } catch (error) {
    console.error('创建任务失败:', error)
    isError.value = true
    message.value = '创建任务失败: ' + error.message
  } finally {
    isCreatingTask.value = false
  }
}

// 更新任务
const updateTask = async () => {
  isUpdatingTask.value = true
  try {
    const { error } = await supabase
      .from('tasks')
      .update({
        title: editingTask.value.title,
        description: editingTask.value.description,
        status: editingTask.value.status
      })
      .eq('id', editingTask.value.id)
    
    if (error) throw error
    
    // 更新本地任务列表
    const index = tasks.value.findIndex(t => t.id === editingTask.value.id)
    if (index !== -1) {
      tasks.value[index] = { ...editingTask.value }
    }
    
    editingTask.value = null
    message.value = '任务更新成功！'
    isError.value = false
  } catch (error) {
    console.error('更新任务失败:', error)
    isError.value = true
    message.value = '更新任务失败: ' + error.message
  } finally {
    isUpdatingTask.value = false
  }
}

// 删除任务
const deleteTask = async (taskId) => {
  if (!confirm('确定要删除这个任务吗？')) return
  
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
    
    if (error) throw error
    
    // 从本地任务列表中移除
    tasks.value = tasks.value.filter(t => t.id !== taskId)
    
    message.value = '任务删除成功！'
    isError.value = false
  } catch (error) {
    console.error('删除任务失败:', error)
    isError.value = true
    message.value = '删除任务失败: ' + error.message
  }
}

// 编辑任务
const editTask = (task) => {
  editingTask.value = { ...task }
}

// 取消编辑
const cancelEdit = () => {
  editingTask.value = null
}

// 取消创建任务
const cancelTask = () => {
  showTaskForm.value = false
  Object.assign(newTask, {
    title: '',
    description: '',
    status: 'pending'
  })
}

// 获取状态样式类
const getStatusClass = (status) => {
  return {
    'pending': 'status-pending',
    'in-progress': 'status-in-progress',
    'completed': 'status-completed'
  }[status]
}

// 获取状态文本
const getStatusText = (status) => {
  return {
    'pending': '待处理',
    'in-progress': '进行中',
    'completed': '已完成'
  }[status]
}

// 格式化日期
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

onMounted(() => {
  fetchProject()
  fetchTasks()
})
</script>

<style scoped>
.project-detail {
  max-width: 1000px;
  margin: 0 auto;
}

.project-header {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.project-header h1 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.project-description {
  color: #666;
  margin-bottom: 1rem;
  line-height: 1.4;
}

.project-meta {
  font-size: 0.9rem;
  color: #999;
}

.tasks-section {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.tasks-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.create-task-btn {
  background: #27ae60;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.task-form-container {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.task-form {
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

input, textarea, select {
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

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.task-item {
  border-left: 4px solid #bdc3c7;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.task-item.status-pending {
  border-left-color: #f39c12;
}

.task-item.status-in-progress {
  border-left-color: #3498db;
}

.task-item.status-completed {
  border-left-color: #27ae60;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.task-header h3 {
  margin: 0;
  color: #2c3e50;
}

.task-actions {
  display: flex;
  gap: 0.5rem;
}

.edit-btn, .delete-btn {
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 0.9rem;
}

.edit-btn {
  background: #3498db;
  color: white;
}

.delete-btn {
  background: #e74c3c;
  color: white;
}

.task-description {
  color: #666;
  margin-bottom: 1rem;
  line-height: 1.4;
}

.task-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
}

.task-status {
  padding: 0.25rem 0.5rem;
  border-radius: 3px;
  font-weight: 500;
}

.status-pending {
  background: #f39c12;
  color: white;
}

.status-in-progress {
  background: #3498db;
  color: white;
}

.status-completed {
  background: #27ae60;
  color: white;
}

.task-date {
  color: #999;
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

.loading, .empty-state {
  text-align: center;
  padding: 2rem;
  color: #666;
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