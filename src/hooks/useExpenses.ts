import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Expense {
  id: string;
  amount: number;
  description: string;
  categoryId: string;
  date: string;
  paymentMethod: string;
  recurring?: {
    enabled: boolean;
    frequency: 'weekly' | 'monthly' | 'yearly';
  };
  receiptUrl?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  isCustom?: boolean;
}

export interface Budget {
  id: string;
  categoryId?: string;
  limit: number;
  period: 'monthly' | 'yearly';
}

export const useExpenses = () => {
  const { user, isAuthenticated } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadData();
    } else {
      setExpenses([]);
      setCategories([]);
      setBudgets([]);
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        loadCategories(),
        loadExpenses(),
        loadBudgets()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at');

    if (error) {
      console.error('Error loading categories:', error);
      return;
    }

    const mappedCategories: Category[] = data.map(cat => ({
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
      isCustom: cat.is_custom
    }));

    setCategories(mappedCategories);
  };

  const loadExpenses = async () => {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error loading expenses:', error);
      return;
    }

    const mappedExpenses: Expense[] = data.map(exp => ({
      id: exp.id,
      amount: parseFloat(exp.amount.toString()),
      description: exp.description,
      categoryId: exp.category_id,
      date: exp.date,
      paymentMethod: exp.payment_method,
      recurring: exp.recurring_enabled ? {
        enabled: exp.recurring_enabled,
        frequency: exp.recurring_frequency as 'weekly' | 'monthly' | 'yearly'
      } : undefined,
      receiptUrl: exp.receipt_url
    }));

    setExpenses(mappedExpenses);
  };

  const loadBudgets = async () => {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .order('created_at');

    if (error) {
      console.error('Error loading budgets:', error);
      return;
    }

    const mappedBudgets: Budget[] = data.map(budget => ({
      id: budget.id,
      categoryId: budget.category_id,
      limit: parseFloat(budget.limit_amount.toString()),
      period: budget.period as 'monthly' | 'yearly'
    }));

    setBudgets(mappedBudgets);
  };

  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('expenses')
      .insert({
        user_id: user.id,
        amount: parseFloat(expense.amount.toString()),
        description: expense.description,
        category_id: expense.categoryId,
        date: expense.date,
        payment_method: expense.paymentMethod,
        recurring_enabled: expense.recurring?.enabled || false,
        recurring_frequency: expense.recurring?.frequency,
        receipt_url: expense.receiptUrl
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding expense:', error);
      throw error;
    }

    // Immediately refresh all data
    await loadData();
  };

  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    const updateData: any = {};
    
    if (updates.amount !== undefined) updateData.amount = parseFloat(updates.amount.toString());
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.categoryId !== undefined) updateData.category_id = updates.categoryId;
    if (updates.date !== undefined) updateData.date = updates.date;
    if (updates.paymentMethod !== undefined) updateData.payment_method = updates.paymentMethod;
    if (updates.recurring !== undefined) {
      updateData.recurring_enabled = updates.recurring.enabled;
      updateData.recurring_frequency = updates.recurring.frequency;
    }
    if (updates.receiptUrl !== undefined) updateData.receipt_url = updates.receiptUrl;

    const { error } = await supabase
      .from('expenses')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error updating expense:', error);
      throw error;
    }

    // Immediately refresh all data
    await loadData();
  };

  const deleteExpense = async (id: string) => {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }

    // Immediately refresh all data
    await loadData();
  };

  const addCategory = async (category: Omit<Category, 'id'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('categories')
      .insert({
        user_id: user.id,
        name: category.name,
        icon: category.icon,
        color: category.color,
        is_custom: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding category:', error);
      throw error;
    }

    // Immediately refresh all data
    await loadData();
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    const { error } = await supabase
      .from('categories')
      .update({
        name: updates.name,
        icon: updates.icon,
        color: updates.color
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating category:', error);
      throw error;
    }

    // Immediately refresh all data
    await loadData();
  };

  const deleteCategory = async (id: string) => {
    // Check if category is being used by expenses
    const isUsed = expenses.some(expense => expense.categoryId === id);
    if (isUsed) {
      throw new Error('Cannot delete category that is being used by expenses');
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting category:', error);
      throw error;
    }

    // Immediately refresh all data
    await loadData();
  };

  const addBudget = async (budget: Omit<Budget, 'id'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('budgets')
      .insert({
        user_id: user.id,
        category_id: budget.categoryId,
        limit_amount: parseFloat(budget.limit.toString()),
        period: budget.period
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding budget:', error);
      throw error;
    }

    // Immediately refresh all data
    await loadData();
  };

  const updateBudget = async (id: string, updates: Partial<Budget>) => {
    const updateData: any = {};
    
    if (updates.categoryId !== undefined) updateData.category_id = updates.categoryId;
    if (updates.limit !== undefined) updateData.limit_amount = parseFloat(updates.limit.toString());
    if (updates.period !== undefined) updateData.period = updates.period;

    const { error } = await supabase
      .from('budgets')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error updating budget:', error);
      throw error;
    }

    // Immediately refresh all data
    await loadData();
  };

  const deleteBudget = async (id: string) => {
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting budget:', error);
      throw error;
    }

    // Immediately refresh all data
    await loadData();
  };

  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const getExpensesByCategory = (categoryId: string) => {
    return expenses.filter(expense => expense.categoryId === categoryId);
  };

  const getExpensesByDateRange = (startDate: Date, endDate: Date) => {
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startDate && expenseDate <= endDate;
    });
  };

  const getBudgetProgress = (categoryId?: string) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && 
             expenseDate.getFullYear() === currentYear &&
             (!categoryId || expense.categoryId === categoryId);
    });

    const spent = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    const relevantBudgets = budgets.filter(budget => 
      budget.period === 'monthly' && 
      (!categoryId || budget.categoryId === categoryId)
    );
    
    const totalBudget = relevantBudgets.reduce((sum, budget) => sum + budget.limit, 0);
    
    return {
      spent,
      budget: totalBudget,
      remaining: totalBudget - spent,
      percentage: totalBudget > 0 ? (spent / totalBudget) * 100 : 0
    };
  };

  return {
    expenses,
    categories,
    budgets,
    totalSpent,
    isLoading,
    addExpense,
    updateExpense,
    deleteExpense,
    addCategory,
    updateCategory,
    deleteCategory,
    addBudget,
    updateBudget,
    deleteBudget,
    getExpensesByCategory,
    getExpensesByDateRange,
    getBudgetProgress,
    refreshData: loadData,
  };
};
