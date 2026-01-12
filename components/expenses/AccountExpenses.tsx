import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../src/supabase';
import { Expense } from '../../types';
import AddExpenseModal from './AddExpenseModal';
import EditExpenseModal from './EditExpenseModal';
import { Button } from '../../src/components/ui/button';
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

interface SimplePerson {
  id: number;
  name: string;
}

export function AccountExpenses() {
  const [accounts, setAccounts] = useState<ExpenseAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const [salesmen, setSalesmen] = useState<SimplePerson[]>([]);
  const [expenseOwners, setExpenseOwners] = useState<SimplePerson[]>([]);

  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(false);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const selectedAccount = useMemo(
    () => accounts.find(a => a.id === selectedAccountId) || null,
    [accounts, selectedAccountId]
  );

  useEffect(() => {
    const fetchAccounts = async () => {
      setIsLoadingAccounts(true);
      try {
        const { data, error } = await supabase
          .from('expense_accounts')
          .select('*')
          .eq('is_active', true)
          .order('category')
          .order('name');

        if (error) throw error;
        const list = (data || []) as ExpenseAccount[];
        setAccounts(list);

        if (list.length > 0 && selectedAccountId === null) {
          setSelectedAccountId(list[0].id);
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load expense accounts');
      } finally {
        setIsLoadingAccounts(false);
      }
    };

    fetchAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchExpenses = async () => {
      if (!selectedAccountId) {
        setExpenses([]);
        return;
      }

      setIsLoadingExpenses(true);
      try {
        const { data, error } = await supabase
          .from('expenses')
          .select('*')
          .eq('account_id', selectedAccountId)
          .order('date', { ascending: false });

        if (error) throw error;

        const mapped = (data || []).map((row: any) => {
          const exp: Expense = {
            id: row.id,
            date: row.date,
            category: row.category,
            name: row.name,
            description: row.description ?? undefined,
            amount: Number(row.amount),
            paymentMethod: row.payment_method ?? row.paymentMethod,
            ownerId: row.owner_id ?? row.ownerId ?? null,
            ownerType: row.owner_type ?? row.ownerType ?? null,
            accountId: row.account_id ?? row.accountId,
            created_at: row.created_at,
            updated_at: row.updated_at,
          };
          return exp;
        });

        setExpenses(mapped);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load expenses');
      } finally {
        setIsLoadingExpenses(false);
      }
    };

    fetchExpenses();
  }, [selectedAccountId]);

  useEffect(() => {
    const fetchPeople = async () => {
      // These tables may not exist in your DB.
      // Keep them optional: if they fail, we silently disable owner selection.
      try {
        const { data: salesmenData, error: salesmenError } = await supabase
          .from('salesmen')
          .select('id,name');
        if (salesmenError) throw salesmenError;
        setSalesmen((salesmenData || []) as SimplePerson[]);
      } catch (err) {
        console.warn('salesmen table not available:', err);
        setSalesmen([]);
      }

      try {
        const { data: ownersData, error: ownersError } = await supabase
          .from('expense_owners')
          .select('id,name');
        if (ownersError) throw ownersError;
        setExpenseOwners((ownersData || []) as SimplePerson[]);
      } catch (err) {
        console.warn('expense_owners table not available:', err);
        setExpenseOwners([]);
      }
    };

    fetchPeople();
  }, []);

  const handleAddOwner = async (name: string) => {
    const { data, error } = await supabase
      .from('expense_owners')
      .insert([{ name }])
      .select()
      .single();

    if (error) throw error;

    const owner = data as SimplePerson;
    setExpenseOwners(prev => [...prev, owner]);
    return owner;
  };

  const handleAddExpense = async (expenseData: Omit<Expense, 'id'>) => {
    if (!selectedAccountId) {
      toast.error('Please select an expense account first');
      return;
    }

    try {
      const payload: any = {
        date: expenseData.date,
        category: expenseData.category,
        name: expenseData.name,
        description: expenseData.description ?? null,
        amount: expenseData.amount,
        payment_method: expenseData.paymentMethod,
        owner_id: expenseData.ownerId,
        owner_type: expenseData.ownerType,
        account_id: selectedAccountId,
      };

      const { data, error } = await supabase.from('expenses').insert([payload]).select().single();
      if (error) throw error;

      const inserted = data as any;
      setExpenses(prev => [
        {
          id: inserted.id,
          date: inserted.date,
          category: inserted.category,
          name: inserted.name,
          description: inserted.description ?? undefined,
          amount: Number(inserted.amount),
          paymentMethod: inserted.payment_method,
          ownerId: inserted.owner_id,
          ownerType: inserted.owner_type,
          accountId: inserted.account_id,
          created_at: inserted.created_at,
          updated_at: inserted.updated_at,
        },
        ...prev,
      ]);

      setIsAddOpen(false);
      toast.success('Expense added');
    } catch (err) {
      console.error(err);
      toast.error('Failed to add expense');
    }
  };

  const handleUpdateExpense = async (updated: Expense) => {
    if (!updated.id) return;

    try {
      const payload: any = {
        date: updated.date,
        category: updated.category,
        name: updated.name,
        description: updated.description ?? null,
        amount: updated.amount,
        payment_method: updated.paymentMethod,
        owner_id: updated.ownerId,
        owner_type: updated.ownerType,
        account_id: updated.accountId,
      };

      const { error } = await supabase.from('expenses').update(payload).eq('id', updated.id);
      if (error) throw error;

      setExpenses(prev => prev.map(e => (e.id === updated.id ? updated : e)));
      setIsEditOpen(false);
      setSelectedExpense(null);
      toast.success('Expense updated');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update expense');
    }
  };

  if (isLoadingAccounts) {
    return <div className="p-6">Loading accounts...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium">Expense Account</label>
          <select
            value={selectedAccountId ?? ''}
            onChange={(e) => setSelectedAccountId(e.target.value ? Number(e.target.value) : null)}
            className="border rounded p-2"
          >
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>
                {acc.name} ({acc.category})
              </option>
            ))}
          </select>
        </div>

        <Button onClick={() => setIsAddOpen(true)} disabled={!selectedAccountId}>
          Add Expense
        </Button>
      </div>

      {selectedAccount ? (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="font-semibold">{selectedAccount.name}</div>
          <div className="text-sm text-gray-600">{selectedAccount.category}</div>
        </div>
      ) : null}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b font-semibold">Expenses</div>
        {isLoadingExpenses ? (
          <div className="p-4">Loading expenses...</div>
        ) : expenses.length === 0 ? (
          <div className="p-4">No expenses for this account yet.</div>
        ) : (
          <div className="divide-y">
            {expenses.map((e) => (
              <div key={e.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">{e.name}</div>
                  <div className="text-sm text-gray-600">
                    {new Date(e.date).toLocaleDateString()} | {e.paymentMethod} | {e.category}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="font-semibold">{Number(e.amount).toLocaleString()}</div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedExpense(e);
                      setIsEditOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddExpenseModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAddExpense={handleAddExpense}
        salesmen={salesmen as any}
        expenseOwners={expenseOwners as any}
        onAddOwner={handleAddOwner as any}
      />

      <EditExpenseModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedExpense(null);
        }}
        expense={selectedExpense}
        onUpdateExpense={handleUpdateExpense}
        salesmen={salesmen as any}
        expenseOwners={expenseOwners as any}
      />
    </div>
  );
}
