// components/expenses/AddExpenseModal.tsx
import { useState, useEffect } from 'react';
import { Expense, Salesman, ExpenseOwner } from '../../types';
import { supabase } from '../../src/supabase';
import { toast } from 'sonner';
import { Button } from '../../src/components/ui/button';
import { Input } from '../../src/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../src/components/ui/select';

interface ExpenseAccount {
  id: number;
  name: string;
  description: string;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  salesmen: Salesman[];
  expenseOwners: ExpenseOwner[];
  onAddOwner: (name: string) => Promise<ExpenseOwner>;
}

export default function AddExpenseModal({ 
  isOpen, 
  onClose, 
  onAddExpense, 
  salesmen, 
  expenseOwners,
  onAddOwner 
}: AddExpenseModalProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Bank'>('Cash');
  const [selectedOwner, setSelectedOwner] = useState('');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [isCreatingOwner, setIsCreatingOwner] = useState(false);
  const [accounts, setAccounts] = useState<ExpenseAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [filteredCategories, setFilteredCategories] = useState<string[]>([]);

  // Fetch active expense accounts
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const { data, error } = await supabase
          .from('expense_accounts')
          .select('*')
          .eq('is_active', true)
          .order('category')
          .order('name');

        if (error) throw error;
        setAccounts(data || []);
        
        // Update categories based on available accounts
        const categories = [...new Set(data?.map(acc => acc.category) || [])];
        setFilteredCategories(categories);
      } catch (error) {
        console.error('Error fetching expense accounts:', error);
        toast.error('Failed to load expense accounts');
      }
    };

    if (isOpen) {
      fetchAccounts();
    }
  }, [isOpen]);

  // Filter accounts based on selected category
  const filteredAccounts = category 
    ? accounts.filter(acc => acc.category === category)
    : accounts;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAccount) {
      toast.error('Please select an expense account');
      return;
    }

    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const [ownerType, ownerId] = selectedOwner ? selectedOwner.split('-') : [null, null];
    const account = accounts.find(acc => acc.id === parseInt(selectedAccount));

    if (!account) {
      toast.error('Selected account not found');
      return;
    }

    const expense: Omit<Expense, 'id'> = {
      date,
      category: account.category,
      name: name || account.name,
      description: description || undefined,
      amount: Number(amount),
      paymentMethod,
      ownerId: ownerId ? Number(ownerId) : null,
      ownerType: (ownerType as 'salesman' | 'owner') || null,
      accountId: account.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    onAddExpense(expense);
  };

  const handleCreateOwner = async () => {
    if (!newOwnerName.trim()) {
      toast.error('Owner name cannot be empty');
      return;
    }
    setIsCreatingOwner(true);
    try {
      const newOwner = await onAddOwner(newOwnerName.trim());
      setNewOwnerName('');
      toast.success('Owner added successfully');
      return newOwner;
    } catch (error) {
      console.error('Error creating owner:', error);
      toast.error('Failed to add owner');
      return null;
    } finally {
      setIsCreatingOwner(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Add New Expense</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium mb-1">Date</label>
              <Input
                type="date"
                id="date"
                name="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium mb-1">Category</label>
              <select
                id="category"
                name="category"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setSelectedAccount(''); // Reset account when category changes
                }}
                className="w-full border rounded p-2"
                required
              >
                <option value="">Select Category</option>
                {Array.isArray(filteredCategories) && filteredCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="account" className="block text-sm font-medium mb-1">Expense Account *</label>
              <select
                id="account"
                name="account"
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="w-full border rounded p-2"
                required
                disabled={!category}
              >
                <option value="">{category ? 'Select Account' : 'Select a category first'}</option>
                {Array.isArray(filteredAccounts) && filteredAccounts
                  .filter(account => account.is_active)
                  .map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name} ({account.category})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-medium mb-1">Amount (PKR) *</label>
              <Input
                type="number"
                id="amount"
                name="amount"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                required
                className="w-full"
                placeholder="0.00"
              />
            </div>

            <div>
              <label htmlFor="paymentMethod" className="block text-sm font-medium mb-1">Payment Method</label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as 'Cash' | 'Bank')}
                className="w-full border rounded p-2"
              >
                <option value="Cash">Cash</option>
                <option value="Bank">Bank Transfer</option>
              </select>
            </div>

            <div>
              <label htmlFor="owner" className="block text-sm font-medium mb-1">Owner (Optional)</label>
              <div className="flex gap-2">
                <select
                  id="owner"
                  name="owner"
                  value={selectedOwner}
                  onChange={(e) => setSelectedOwner(e.target.value)}
                  className="flex-1 border rounded p-2"
                >
                  <option value="">None</option>
                  <optgroup label="Salesmen">
                    {salesmen.map((salesman) => (
                      <option key={`salesman-${salesman.id}`} value={`salesman-${salesman.id}`}>
                        {salesman.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Owners">
                    {expenseOwners.map((owner) => (
                      <option key={`owner-${owner.id}`} value={`owner-${owner.id}`}>
                        {owner.name}
                      </option>
                    ))}
                  </optgroup>
                </select>
                <div className="flex">
                  <input
                    type="text"
                    id="newOwner"
                    name="newOwner"
                    value={newOwnerName}
                    onChange={(e) => setNewOwnerName(e.target.value)}
                    placeholder="New owner name"
                    className="border rounded-l p-2 text-sm flex-1 min-w-0"
                  />
                  <button
                    type="button"
                    onClick={handleCreateOwner}
                    disabled={isCreatingOwner || !newOwnerName.trim()}
                    className="bg-blue-500 text-white px-3 rounded-r hover:bg-blue-600 disabled:opacity-50"
                  >
                    {isCreatingOwner ? 'Adding...' : 'Add'}
                  </button>
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="expenseName" className="block text-sm font-medium mb-1">Description</label>
              <Input
                type="text"
                id="expenseName"
                name="expenseName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Expense description"
                className="w-full"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="notes" className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border rounded p-2 min-h-[80px]"
                placeholder="Additional notes (optional)"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !selectedAccount}>
              {isLoading ? 'Saving...' : 'Save Expense'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}