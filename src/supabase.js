import { createClient } from '@supabase/supabase-js'

// 请替换为您的Supabase项目URL和anon key
const supabaseUrl = 'https://ztembyarrbkwprmzscuy.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0ZW1ieWFycmJrd3BybXpzY3V5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyNTExOTIsImV4cCI6MjA3ODgyNzE5Mn0.gcUbRtxOYEK7Zbf4kfaMf4WSPerFTLUC0Z1GRUiG7kI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default supabase