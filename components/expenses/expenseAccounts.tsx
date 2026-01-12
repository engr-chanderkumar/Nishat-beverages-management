// components/expenses/ExpenseAccounts.tsx
import { useEffect, useState, type FormEvent } from 'react';
import { supabase } from '../../src/supabase';
import { Button } from '../../src/components/ui/button';
import { Input } from '../../src/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../src/components/ui/table';
import { Plus, Trash2, Edit, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface ExpenseAccount {
  id: number;
  name: string;
  description: string;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function ExpenseAccounts() {
  const [accounts, setAccounts] = useState<ExpenseAccount[]>([]);
  const [newAccount, setNewAccount] = useState({ name: '', description: '', category: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<ExpenseAccount>>({});

  const getSupabaseErrorMessage = (err: unknown): string => {
    const anyErr = err as any;
    if (anyErr?.message && typeof anyErr.message === 'string') return anyErr.message;
    if (anyErr?.error_description && typeof anyErr.error_description === 'string') return anyErr.error_description;
    if (typeof err === 'string') return err;
    try {
      return JSON.stringify(err);
    } catch {
      return 'Unknown error';
    }
  };

  const EXPENSE_CATEGORIES = [
    "Salary",
    "Utilities",
    "Rent",
    "Marketing",
    "Maintenance",
    "Supplies",
    "Transportation",
    "Other"
  ];

  // Fetch expense accounts
  const fetchAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('expense_accounts')
        .select('*')
        .order('category')
        .order('name');

      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error('Error fetching expense accounts:', error);
      toast.error(getSupabaseErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  // Add new expense account
  const addAccount = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newAccount.name.trim() || !newAccount.category) {
      toast.error('Account name and category are required');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('expense_accounts')
        .insert([{ 
          name: newAccount.name.trim(),
          description: newAccount.description.trim() || null,
          category: newAccount.category,
          is_active: true
        }])
        .select();

      if (error) throw error;

      setAccounts([...accounts, ...(data || [])]);
      setNewAccount({ name: '', description: '', category: '' });
      toast.success('Expense account added successfully');
    } catch (error) {
      console.error('Error adding expense account:', error);
      toast.error(getSupabaseErrorMessage(error));
    }
  };

  // Update expense account
  const updateAccount = async (id: number) => {
    if (!editData.name?.trim() || !editData.category) {
      toast.error('Account name and category are required');
      return;
    }

    try {
      const { error } = await supabase
        .from('expense_accounts')
        .update({ 
          name: editData.name.trim(),
          description: editData.description?.trim() || null,
          category: editData.category,
          is_active: editData.is_active
        })
        .eq('id', id);

      if (error) throw error;

      setAccounts(accounts.map(account => 
        account.id === id ? { ...account, ...editData } as ExpenseAccount : account
      ));
      setEditingId(null);
      toast.success('Account updated successfully');
    } catch (error) {
      console.error('Error updating account:', error);
      toast.error('Failed to update account');
    }
  };

  // Toggle account active status
  const toggleAccountStatus = async (id: number, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('expense_accounts')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      setAccounts(accounts.map(account => 
        account.id === id ? { ...account, is_active: !currentStatus } : account
      ));
      toast.success(`Account ${currentStatus ? 'deactivated' : 'activated'} successfully`);
    } catch (error) {
      console.error('Error updating account status:', error);
      toast.error('Failed to update account status');
    }
  };

  // Delete account
  const deleteAccount = async (id: number) => {
    if (!confirm('Are you sure you want to delete this account? This action cannot be undone.')) return;

    try {
      // Check if there are any expenses using this account
      const { count, error: countError } = await supabase
        .from('expenses')
        .select('*', { count: 'exact', head: true })
        .eq('account_id', id);

      if (countError) throw countError;
      if (count && count > 0) {
        throw new Error('Cannot delete account with existing expenses');
      }

      const { error } = await supabase
        .from('expense_accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAccounts(accounts.filter(account => account.id !== id));
      toast.success('Account deleted successfully');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete account');
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading expense accounts...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Expense Accounts</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Add New Expense Account</h2>
        <form onSubmit={addAccount} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Account Name *</label>
              <Input
                type="text"
                value={newAccount.name}
                onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                placeholder="e.g., Office Rent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category *</label>
              <select
                value={newAccount.category}
                onChange={(e) => setNewAccount({ ...newAccount, category: e.target.value })}
                className="w-full border rounded p-2"
                required
              >
                <option value="">Select Category</option>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Input
                type="text"
                value={newAccount.description}
                onChange={(e) => setNewAccount({ ...newAccount, description: e.target.value })}
                placeholder="Optional description"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit">
              <Plus className="mr-2 h-4 w-4" /> Add Account
            </Button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((account) => (
              <TableRow key={account.id}>
                <TableCell className="font-medium">
                  {editingId === account.id ? (
                    <Input
                      value={editData.name || account.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className="w-full"
                    />
                  ) : (
                    account.name
                  )}
                </TableCell>
                <TableCell>
                  {editingId === account.id ? (
                    <select
                      value={editData.category || account.category}
                      onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                      className="w-full border rounded p-1"
                    >
                      {EXPENSE_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  ) : (
                    account.category
                  )}
                </TableCell>
                <TableCell>
                  {editingId === account.id ? (
                    <Input
                      value={editData.description ?? account.description}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      className="w-full"
                    />
                  ) : (
                    account.description || '-'
                  )}
                </TableCell>
                <TableCell>
                  {editingId === account.id ? (
                    <select
                      value={editData.is_active?.toString() ?? account.is_active.toString()}
                      onChange={(e) =>
                        setEditData({ ...editData, is_active: e.target.value === 'true' })
                      }
                      className="border rounded p-1"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  ) : (
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        account.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {account.is_active ? 'Active' : 'Inactive'}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  {editingId === account.id ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateAccount(account.id)}
                      >
                        <Check className="h-4 w-4 mr-1" /> Save
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingId(null);
                          setEditData({});
                        }}
                      >
                        <X className="h-4 w-4 mr-1" /> Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingId(account.id);
                          setEditData({
                            name: account.name,
                            description: account.description,
                            category: account.category,
                            is_active: account.is_active,
                          });
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleAccountStatus(account.id, account.is_active)}
                      >
                        {account.is_active ? (
                          <span className="text-yellow-600">Deactivate</span>
                        ) : (
                          <span className="text-green-600">Activate</span>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteAccount(account.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}