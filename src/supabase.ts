import { createClient } from '@supabase/supabase-js'

console.log('Environment variables check:')
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '***KEY_FOUND***' : 'MISSING')

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://abpudzpyakvmyvwjriyw.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFicHVkenB5YWt2bXl2d2pyaXl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1OTg5OTMsImV4cCI6MjA4MzE3NDk5M30.3NB2Vj-W5IF13IFUXDVQpDaM08sTFJ_-0FKrQKNvyho'

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables:')
  console.error('- VITE_SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING')
  console.error('- VITE_SUPABASE_ANON_KEY:', supabaseKey ? 'SET' : 'MISSING')
  console.log('Using fallback values for development...')
}

export const supabase = createClient(supabaseUrl, supabaseKey)