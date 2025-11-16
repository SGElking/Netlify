# Vue + Supabase 项目管理应用

这是一个使用 Vue 3 和 Supabase 构建的完整项目管理应用，包含用户认证、项目管理和任务管理功能。

## 功能特性

- ✅ 用户认证（登录/注册）
- ✅ 项目管理（创建、查看项目列表）
- ✅ 任务管理（创建、编辑、删除任务）
- ✅ 路由保护（未登录用户重定向到登录页）
- ✅ 响应式设计

## 技术栈

- **前端框架**: Vue 3
- **路由**: Vue Router 4
- **状态管理**: Pinia
- **构建工具**: Vite
- **后端服务**: Supabase
- **样式**: 原生 CSS

## 项目结构

```
src/
├── App.vue                 # 根组件
├── main.js                 # 应用入口
├── supabase.js            # Supabase 客户端配置
├── router/
│   └── index.js           # 路由配置
├── stores/
│   └── auth.js            # 认证状态管理
└── views/
    ├── AuthPage.vue       # 认证页面
    ├── DashboardPage.vue  # 仪表板页面
    └── ProjectDetailPage.vue # 项目详情页面
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 Supabase

1. 前往 [Supabase](https://supabase.com) 创建新项目
2. 获取项目 URL 和 anon key
3. 编辑 `src/supabase.js` 文件，替换以下内容：

```javascript
const supabaseUrl = 'https://your-project.supabase.co'  // 替换为您的项目 URL
const supabaseAnonKey = 'your-anon-key'                // 替换为您的 anon key
```

### 3. 设置数据库

在 Supabase Dashboard 的 SQL Editor 中执行 `supabase_tables.sql` 文件中的 SQL 语句来创建数据库表。

### 4. 启动开发服务器

```bash
npm run dev
```

应用将在 http://localhost:3000 启动。

## 页面说明

### /auth - 认证页面
- 用户登录和注册功能
- 使用 Supabase `signInWithPassword()` 和 `signUp()` 方法
- 自动重定向到仪表板（如果已登录）

### /dashboard - 仪表板
- 显示当前用户的项目列表
- 创建新项目的表单
- 使用 Supabase `insert()` 方法添加项目到 projects 表
- 路由保护：未登录用户自动重定向到 /auth

### /projects/:id - 项目详情
- 根据 URL 参数显示特定项目的详细信息
- 管理项目下的任务（创建、更新、删除）
- 使用 Supabase 从 projects 和 tasks 表获取数据
- 路由保护：未登录用户自动重定向到 /auth

## 数据库表结构

### projects 表
- `id` (UUID) - 主键
- `name` (TEXT) - 项目名称
- `description` (TEXT) - 项目描述
- `created_at` (TIMESTAMP) - 创建时间
- `updated_at` (TIMESTAMP) - 更新时间

### tasks 表
- `id` (UUID) - 主键
- `project_id` (UUID) - 外键，关联 projects 表
- `title` (TEXT) - 任务标题
- `description` (TEXT) - 任务描述
- `status` (TEXT) - 任务状态（pending/in-progress/completed）
- `created_at` (TIMESTAMP) - 创建时间
- `updated_at` (TIMESTAMP) - 更新时间

## 构建生产版本

```bash
npm run build
```

构建后的文件将生成在 `dist` 目录中。

## 注意事项

1. **Supabase 配置**: 请确保正确配置 Supabase 项目 URL 和 anon key
2. **数据库权限**: 当前配置允许所有用户访问所有数据，生产环境请根据需要调整 RLS 策略
3. **认证状态**: 应用会自动监听认证状态变化并更新用户状态
4. **错误处理**: 所有 Supabase 操作都包含错误处理，会显示相应的错误信息

## 开发命令

- `npm run dev` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm run preview` - 预览生产构建

## 许可证

MIT License