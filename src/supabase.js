import { createClient } from '@supabase/supabase-js'

// 请替换为您的Supabase项目URL和anon key
const supabaseUrl = 'https://your-project.supabase.co'
const supabaseAnonKey = 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default supabase