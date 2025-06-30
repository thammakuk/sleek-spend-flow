
import { useState, useEffect } from "react";

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
  categoryId?: string; // undefined means overall budget
  limit: number;
  period: 'monthly' | 'yearly';
}

const defaultCategories: Category[] = [
  { id: '1', name: 'Food', icon: '🍕', color: '#F97316' },
  { id: '2', name: 'Rent', icon: '🏠', color: '#3B82F6' },
  { id: '3', name: 'Transport', icon: '🚗', color: '#10B981' },
  { id: '4', name: 'Shopping', icon: '🛒', color: '#8B5CF6' },
  { id: '5', name: 'Bills', icon: '⚡', color: '#EF4444' },
  { id: '6', name: 'Medical', icon: '🏥', color: '#14B8A6' },
  { id: '7', name: 'Education', icon: '📚', color: '#6366F1' },
  { id: '8', name: 'Misc', icon: '📦', color: '#6B7280' },
];

const sampleExpenses: Expense[] = [
  {
    id: '1',
    amount: 25.50,
    description: 'Lunch at downtown cafe',
    categoryId: '1',
    date: new Date().toISOString(),
    paymentMethod: 'Credit Card'
  },
  {
    id: '2',
    amount: 1200,
    description: 'Monthly rent payment',
    categoryId: '2',
    date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    paymentMethod: 'Bank Transfer',
    recurring: { enabled: true, frequency: 'monthly' }
  },
  {
    id: '3',
    amount: 45.80,
    description: 'Gas station fill-up',
    categoryId: '3',
    date: new Date(Date.now() - 2 * 86400000).toISOString(), // 2 days ago
    paymentMethod: 'Debit Card'
  },
];

const sampleBudgets: Budget[] = [
  { id: '1', limit: 2500, period: 'monthly' }, // Overall monthly budget
  { id: '2', categoryId: '1', limit: 500, period: 'monthly' }, // Food budget
  { id: '3', categoryId: '3', limit: 200, period: 'monthly' }, // Transport budget
];

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [budgets, setBudgets] = useState<Budget[]>(sampleBudgets);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedExpenses = localStorage.getItem('expense-tracker-expenses');
    const savedCategories = localStorage.getItem('expense-tracker-categories');
    const savedBudgets = localStorage.getItem('expense-tracker-budgets');

    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    } else {
      setExpenses(sampleExpenses);
    }

    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    }

    if (savedBudgets) {
      setBudgets(JSON.parse(savedBudgets));
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('expense-tracker-expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('expense-tracker-categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('expense-tracker-budgets', JSON.stringify(budgets));
  }, [budgets]);

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString(),
    };
    setExpenses(prev => [...prev, newExpense]);
  };

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    setExpenses(prev => prev.map(expense => 
      expense.id === id ? { ...expense, ...updates } : expense
    ));
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id));
  };

  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...category,
      id: Date.now().toString(),
      isCustom: true,
    };
    setCategories(prev => [...prev, newCategory]);
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories(prev => prev.map(category => 
      category.id === id ? { ...category, ...updates } : category
    ));
  };

  const deleteCategory = (id: string) => {
    // Don't delete if it's being used by expenses
    const isUsed = expenses.some(expense => expense.categoryId === id);
    if (!isUsed) {
      setCategories(prev => prev.filter(category => category.id !== id));
    }
  };

  const addBudget = (budget: Omit<Budget, 'id'>) => {
    const newBudget: Budget = {
      ...budget,
      id: Date.now().toString(),
    };
    setBudgets(prev => [...prev, newBudget]);
  };

  const updateBudget = (id: string, updates: Partial<Budget>) => {
    setBudgets(prev => prev.map(budget => 
      budget.id === id ? { ...budget, ...updates } : budget
    ));
  };

  const deleteBudget = (id: string) => {
    setBudgets(prev => prev.filter(budget => budget.id !== id));
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

  return {
    expenses,
    categories,
    budgets,
    totalSpent,
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
  };
};
