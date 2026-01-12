import React, { useState } from 'react'
import { ExpenseAccounts } from '../components/expenses/expenseAccounts'
import { AccountExpenses } from '../components/expenses/AccountExpenses'
import Dashboard from '../components/dashboard/Dashboard'
import CustomerAccounts from '../components/customer/CustomerAccounts'
import Inventory from '../components/dashboard/Inventory'
import ClosingReport from '../components/dashboard/ClosingReport'
import { Toaster } from 'sonner'

function App() {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'sales' | 'inventory' | 'customers' | 'salesmen' | 'expenses' | 'accounts' | 'reports'
  >('dashboard')

  return (
    <div className="min-h-screen">
      <header className="bg-brand-blue text-white p-4">
        <h1 className="text-2xl font-bold">Nishat Beverages</h1>
      </header>
      
      <main className="container mx-auto p-4">
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'dashboard', label: 'Dashboard' },
            { key: 'sales', label: 'Sales' },
            { key: 'inventory', label: 'Inventory' },
            { key: 'customers', label: 'Customers' },
            { key: 'salesmen', label: 'Salesmen' },
            { key: 'expenses', label: 'Expenses' },
            { key: 'accounts', label: 'Accounts' },
            { key: 'reports', label: 'Reports' },
          ].map(({ key, label }) => (
            <button
              key={key}
              className={`px-4 py-2 rounded ${
                activeTab === key ? 'bg-brand-lightblue text-white' : 'bg-gray-200'
              }`}
              onClick={() => setActiveTab(key as any)}
            >
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'dashboard' && <Dashboard user={null} onLogout={() => {}} />}
        {activeTab === 'sales' && <div className="p-4 text-center text-gray-500">Sales module (placeholder)</div>}
        {activeTab === 'inventory' && <Inventory inventory={[]} onAddItem={() => {}} onEditItem={() => {}} onUpdateStock={() => {}} onSellItem={() => {}} onDeleteItem={() => {}} onViewDetails={() => {}} />}
        {activeTab === 'customers' && <CustomerAccounts customers={[]} sales={[]} onAddSale={() => {}} onViewDetails={() => {}} onEditCustomer={() => {}} onDeleteCustomer={() => {}} onCollectEmpties={() => {}} />}
        {activeTab === 'salesmen' && <div className="p-4 text-center text-gray-500">Salesmen module (placeholder)</div>}
        {activeTab === 'expenses' && <AccountExpenses />}
        {activeTab === 'accounts' && <ExpenseAccounts />}
        {activeTab === 'reports' && <ClosingReport sales={[]} expenses={[]} customers={[]} closingRecords={[]} onInitiateClose={() => {}} />}
      </main>

      <Toaster position="top-right" />
    </div>
  )
}

export default App
