
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  DollarSign,
  PieChart as PieChartIcon,
  BarChart3,
  Download,
  Eye,
  EyeOff
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { useExpenses } from "@/hooks/useExpenses";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export const Insights = () => {
  const { expenses, categories, budgets } = useExpenses();
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState<'7d' | '1m' | '3m' | '6m' | '1y'>('1m');
  const [showAmounts, setShowAmounts] = useState(true);

  // Get date range
  const getDateRange = () => {
    const now = new Date();
    const ranges = {
      '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      '1m': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      '3m': new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      '6m': new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000),
      '1y': new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
    };
    return ranges[timeRange];
  };

  // Filter expenses by date range
  const filteredExpenses = useMemo(() => {
    const startDate = getDateRange();
    return expenses.filter(expense => new Date(expense.date) >= startDate);
  }, [expenses, timeRange]);

  // Monthly spending trend
  const monthlyTrend = useMemo(() => {
    const monthlyData: { [key: string]: number } = {};
    
    filteredExpenses.forEach(expense => {
      const date = new Date(expense.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + expense.amount;
    });

    return Object.entries(monthlyData)
      .map(([month, amount]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { 
          month: 'short', 
          year: 'numeric' 
        }),
        amount
      }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
  }, [filteredExpenses]);

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const categoryTotals: { [key: string]: number } = {};
    
    filteredExpenses.forEach(expense => {
      categoryTotals[expense.categoryId] = (categoryTotals[expense.categoryId] || 0) + expense.amount;
    });

    return categories
      .map(category => ({
        id: category.id,
        name: category.name,
        icon: category.icon,
        color: category.color,
        amount: categoryTotals[category.id] || 0,
        percentage: filteredExpenses.length > 0 
          ? ((categoryTotals[category.id] || 0) / filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0)) * 100
          : 0
      }))
      .filter(item => item.amount > 0)
      .sort((a, b) => b.amount - a.amount);
  }, [filteredExpenses, categories]);

  // Daily average spending
  const dailyAverage = useMemo(() => {
    if (filteredExpenses.length === 0) return 0;
    
    const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const daysDiff = Math.max(1, Math.ceil((new Date().getTime() - getDateRange().getTime()) / (24 * 60 * 60 * 1000)));
    
    return totalAmount / daysDiff;
  }, [filteredExpenses, timeRange]);

  // Top spending days
  const topSpendingDays = useMemo(() => {
    const dailyTotals: { [key: string]: number } = {};
    
    filteredExpenses.forEach(expense => {
      const dateKey = new Date(expense.date).toDateString();
      dailyTotals[dateKey] = (dailyTotals[dateKey] || 0) + expense.amount;
    });

    return Object.entries(dailyTotals)
      .map(([date, amount]) => ({
        date: new Date(date).toLocaleDateString('en-US', { 
          weekday: 'short',
          month: 'short', 
          day: 'numeric' 
        }),
        amount
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [filteredExpenses]);

  // Budget analysis
  const budgetAnalysis = useMemo(() => {
    return budgets.map(budget => {
      const categoryExpenses = budget.categoryId
        ? filteredExpenses.filter(exp => exp.categoryId === budget.categoryId)
        : filteredExpenses;
      
      const spent = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      const percentage = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
      const category = budget.categoryId ? categories.find(c => c.id === budget.categoryId) : null;
      
      return {
        id: budget.id,
        name: category ? category.name : 'Overall Budget',
        icon: category?.icon || '💰',
        color: category?.color || '#6366F1',
        budget: budget.limit,
        spent,
        remaining: budget.limit - spent,
        percentage
      };
    });
  }, [budgets, filteredExpenses, categories]);

  const handleExportData = () => {
    try {
      const exportData = {
        expenses: filteredExpenses,
        summary: {
          totalSpent: filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0),
          totalTransactions: filteredExpenses.length,
          dailyAverage,
          timeRange,
          generatedAt: new Date().toISOString()
        },
        categoryBreakdown,
        monthlyTrend,
        budgetAnalysis
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `expense-report-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
      
      toast({
        title: "Report exported",
        description: "Your expense report has been downloaded successfully."
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Unable to export report. Please try again.",
        variant: "destructive"
      });
    }
  };

  const totalSpent = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Insights</h1>
          <p className="text-muted-foreground mt-1">
            Financial analysis and trends
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAmounts(!showAmounts)}
            className="touch-target"
          >
            {showAmounts ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportData}
            className="touch-target"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Time Range Selector */}
      <Card className="glass-card">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">Analysis Period</h3>
              <p className="text-sm text-muted-foreground">
                {filteredExpenses.length} transactions • {showAmounts ? formatCurrency(totalSpent) : '••••'}
              </p>
            </div>
            <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 Days</SelectItem>
                <SelectItem value="1m">1 Month</SelectItem>
                <SelectItem value="3m">3 Months</SelectItem>
                <SelectItem value="6m">6 Months</SelectItem>
                <SelectItem value="1y">1 Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card animate-slide-up">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Daily Average
            </CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {showAmounts ? formatCurrency(dailyAverage) : '••••'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Per day spending
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Top Category
            </CardTitle>
            <PieChartIcon className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {categoryBreakdown[0]?.name || 'No data'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {categoryBreakdown[0] && showAmounts 
                ? formatCurrency(categoryBreakdown[0].amount)
                : '••••'
              }
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Transactions
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-expense-purple" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {filteredExpenses.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total expenses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        {monthlyTrend.length > 0 && (
          <Card className="glass-card animate-slide-up">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Spending Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="month" 
                      className="text-xs"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      className="text-xs"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => showAmounts ? `$${value}` : '••'}
                    />
                    <Tooltip 
                      formatter={(value: number) => [
                        showAmounts ? formatCurrency(value) : '••••', 
                        'Amount'
                      ]}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="hsl(var(--primary))" 
                      fillOpacity={1} 
                      fill="url(#colorAmount)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Category Breakdown */}
        {categoryBreakdown.length > 0 && (
          <Card className="glass-card animate-slide-up">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Category Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryBreakdown.slice(0, 6).map((category, index) => (
                  <div key={category.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                        style={{ backgroundColor: `${category.color}20`, color: category.color }}
                      >
                        {category.icon}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{category.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {category.percentage.toFixed(1)}% of total
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        {showAmounts ? formatCurrency(category.amount) : '••••'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Budget Analysis */}
      {budgetAnalysis.length > 0 && (
        <Card className="glass-card animate-slide-up">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Budget Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {budgetAnalysis.map((budget) => (
                <div key={budget.id} className="p-4 rounded-xl bg-muted/50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{budget.icon}</span>
                      <span className="font-medium text-foreground">{budget.name}</span>
                    </div>
                    <Badge 
                      variant={budget.percentage > 100 ? "destructive" : budget.percentage > 80 ? "secondary" : "outline"}
                      className="text-xs"
                    >
                      {budget.percentage.toFixed(0)}%
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Spent: {showAmounts ? formatCurrency(budget.spent) : '••••'}
                      </span>
                      <span className="text-muted-foreground">
                        Budget: {showAmounts ? formatCurrency(budget.budget) : '••••'}
                      </span>
                    </div>
                    
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          budget.percentage > 100 
                            ? 'bg-destructive' 
                            : budget.percentage > 80 
                              ? 'bg-orange-500' 
                              : 'bg-primary'
                        }`}
                        style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                      />
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className={`font-medium ${
                        budget.remaining < 0 ? 'text-destructive' : 'text-muted-foreground'
                      }`}>
                        {budget.remaining < 0 ? 'Over by: ' : 'Remaining: '}
                        {showAmounts ? formatCurrency(Math.abs(budget.remaining)) : '••••'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Spending Days */}
      {topSpendingDays.length > 0 && (
        <Card className="glass-card animate-slide-up">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Highest Spending Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topSpendingDays.map((day, index) => (
                <div key={day.date} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">
                      #{index + 1}
                    </div>
                    <span className="font-medium text-foreground">{day.date}</span>
                  </div>
                  <span className="font-semibold text-foreground">
                    {showAmounts ? formatCurrency(day.amount) : '••••'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {filteredExpenses.length === 0 && (
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted/50 flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No data available</h3>
              <p className="text-muted-foreground">
                Add some expenses to see insights and analytics
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
