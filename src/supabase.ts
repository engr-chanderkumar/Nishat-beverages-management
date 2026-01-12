import { createClient } from '@supabase/supabase-js'

console.log('Environment variables check:')
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '***KEY_FOUND***' : 'MISSING')

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables:')
  console.error('- VITE_SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING')
  console.error('- VITE_SUPABASE_ANON_KEY:', supabaseKey ? 'SET' : 'MISSING')
  throw new Error(
    'Missing Supabase env vars. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env and restart the dev server.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseKey)