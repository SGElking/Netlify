import { createClient } from '@supabase/supabase-js'

// 请替换为您的Supabase项目URL和anon key
const supabaseUrl = 'https://ztembyarrbkwprmzscuy.supabase.co'
const supabaseAnonKey = process.env.SUPABASE_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default supabase