import React, { useState, useEffect } from 'react'
import { supabase } from './supabase'

export default function TestPage() {
  const [supabaseStatus, setSupabaseStatus] = useState<'loading' | 'connected' | 'error'>('loading')
  const [tables, setTables] = useState<string[]>([])

  useEffect(() => {
    async function testSupabase() {
      try {
        // Test basic connection
        const { data, error } = await supabase.from('expense_accounts').select('count').limit(1)
        
        if (error) {
          console.error('Supabase error:', error)
          setSupabaseStatus('error')
        } else {
          setSupabaseStatus('connected')
          
          // List tables (optional)
          const { data: tablesData } = await supabase.rpc('get_tables') // This might not exist, so we'll skip
        }
      } catch (err) {
        console.error('Supabase connection error:', err)
        setSupabaseStatus('error')
      }
    }

    testSupabase()
  }, [])

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-brand-blue mb-6">Test Page</h1>
      
      {/* Tailwind Test */}
      <div className="bg-brand-surface rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-brand-text-primary mb-4">Tailwind CSS Test</h2>
        <div className="space-y-4">
          <button className="bg-brand-blue text-white px-6 py-2 rounded-lg hover:bg-brand-lightblue transition-colors">
            Primary Button
          </button>
          <button className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors ml-4">
            Secondary Button
          </button>
          <div className="bg-brand-bg p-4 rounded border border-gray-200">
            <p className="text-brand-text-secondary">This uses custom brand colors and spacing.</p>
          </div>
        </div>
      </div>

      {/* Supabase Test */}
      <div className="bg-brand-surface rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-brand-text-primary mb-4">Supabase Connection Test</h2>
        <div className="space-y-2">
          <p className="text-brand-text-secondary">Status: 
            <span className={`ml-2 font-semibold ${
              supabaseStatus === 'connected' ? 'text-green-600' : 
              supabaseStatus === 'error' ? 'text-red-600' : 
              'text-yellow-600'
            }`}>
              {supabaseStatus === 'connected' ? '✅ Connected' : 
               supabaseStatus === 'error' ? '❌ Error' : 
               '⏳ Loading...'}
            </span>
          </p>
          {supabaseStatus === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-red-700 text-sm">
                Check your .env file and Supabase configuration.
              </p>
            </div>
          )}
          {supabaseStatus === 'connected' && (
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <p className="text-green-700 text-sm">
                Supabase connection successful! You can now test Expenses/Accounts CRUD.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded p-4">
        <h3 className="font-semibold text-blue-800 mb-2">Next Steps:</h3>
        <ol className="list-decimal list-inside text-blue-700 space-y-1 text-sm">
          <li>If Tailwind styles are visible above, CSS is working</li>
          <li>If Supabase shows "Connected", backend is working</li>
          <li>Go back to main app and test Expenses/Accounts tabs</li>
          <li>If you see errors, check browser console and Vite terminal</li>
        </ol>
      </div>
    </div>
  )
}
