
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  AlertTriangle,
  Eye,
  EyeOff
} from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { useExpenses } from "@/hooks/useExpenses";
import { formatCurrency } from "@/lib/utils";

export const Dashboard = () => {
  const { expenses, totalSpent, budgets, categories } = useExpenses();
  const [showAmounts, setShowAmounts] = useState(true);
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  // Get current month expenses
  const currentMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
  });

  // Calculate monthly totals
  const monthlyTotal = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalBudget = budgets.reduce((sum, budget) => sum + budget.limit, 0);
  const remainingBudget = totalBudget - monthlyTotal;
  const budgetProgress = totalBudget > 0 ? (monthlyTotal / totalBudget) * 100 : 0;

  // Category breakdown
  const categoryBreakdown = categories.map(category => {
    const categoryExpenses = currentMonthExpenses.filter(expense => expense.categoryId === category.id);
    const total = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    return {
      name: category.name,
      value: total,
      color: category.color,
      icon: category.icon
    };
  }).filter(item => item.value > 0);

  // Recent expenses (last 5)
  const recentExpenses = [...currentMonthExpenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Previous month comparison
  const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const previousMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === previousMonth && expenseDate.getFullYear() === previousYear;
  });
  const previousMonthTotal = previousMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const monthlyChange = previousMonthTotal > 0 ? ((monthlyTotal - previousMonthTotal) / previousMonthTotal) * 100 : 0;

  const displayAmount = (amount: number) => showAmounts ? formatCurrency(amount) : '••••';

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            {new Date().toLocaleDateString('en-US', { 
              month: 'long', 
              year: 'numeric' 
            })}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAmounts(!showAmounts)}
          className="touch-target"
        >
          {showAmounts ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card animate-slide-up">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Monthly Spent
            </CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {displayAmount(monthlyTotal)}
            </div>
            <div className="flex items-center mt-2">
              {monthlyChange > 0 ? (
                <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
              )}
              <span className={`text-sm ${monthlyChange > 0 ? 'text-red-500' : 'text-green-500'}`}>
                {Math.abs(monthlyChange).toFixed(1)}% from last month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Budget Remaining
            </CardTitle>
            <Calendar className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {displayAmount(remainingBudget)}
            </div>
            <div className="mt-2">
              <Progress 
                value={budgetProgress} 
                className="h-2"
              />
              <p className="text-sm text-muted-foreground mt-1">
                {budgetProgress.toFixed(1)}% of budget used
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Expenses
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-expense-purple" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {currentMonthExpenses.length}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Transactions this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Alert */}
      {budgetProgress > 80 && (
        <Card className="glass-card border-orange-500/50 bg-orange-500/10 animate-slide-up">
          <CardContent className="flex items-center space-x-3 pt-6">
            <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0" />
            <div>
              <p className="font-medium text-orange-700 dark:text-orange-300">
                Budget Alert
              </p>
              <p className="text-sm text-orange-600 dark:text-orange-400">
                You've used {budgetProgress.toFixed(1)}% of your monthly budget. Consider reviewing your spending.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        {categoryBreakdown.length > 0 && (
          <Card className="glass-card animate-slide-up">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Category Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                    >
                      {categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {categoryBreakdown.map((category, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm text-muted-foreground truncate">
                      {category.name}
                    </span>
                    <span className="text-sm font-medium ml-auto">
                      {showAmounts ? formatCurrency(category.value) : '••'}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Expenses */}
        <Card className="glass-card animate-slide-up">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Recent Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentExpenses.length > 0 ? (
                recentExpenses.map((expense) => {
                  const category = categories.find(c => c.id === expense.categoryId);
                  return (
                    <div key={expense.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-sm"
                          style={{ backgroundColor: `${category?.color}20`, color: category?.color }}
                        >
                          {category?.icon}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{expense.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(expense.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-foreground">
                          {displayAmount(expense.amount)}
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          {category?.name}
                        </Badge>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No expenses this month</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Start tracking by adding your first expense
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
