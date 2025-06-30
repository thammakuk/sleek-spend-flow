
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Calendar,
  ArrowUpDown,
  Eye,
  EyeOff
} from "lucide-react";
import { useExpenses } from "@/hooks/useExpenses";
import { formatCurrency, formatDateRelative, groupExpensesByDate } from "@/lib/utils";
import { AddExpenseModal } from "@/components/AddExpenseModal";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

export const ExpenseHistory = () => {
  const { expenses, categories, deleteExpense } = useExpenses();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'description'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showAmounts, setShowAmounts] = useState(true);
  const [editingExpense, setEditingExpense] = useState<any>(null);

  // Get unique payment methods
  const paymentMethods = useMemo(() => {
    const methods = [...new Set(expenses.map(expense => expense.paymentMethod))];
    return methods.sort();
  }, [expenses]);

  // Filter and sort expenses
  const filteredExpenses = useMemo(() => {
    let filtered = expenses.filter(expense => {
      const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || expense.categoryId === selectedCategory;
      const matchesPaymentMethod = selectedPaymentMethod === 'all' || expense.paymentMethod === selectedPaymentMethod;
      
      return matchesSearch && matchesCategory && matchesPaymentMethod;
    });

    // Sort expenses
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'description':
          comparison = a.description.localeCompare(b.description);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [expenses, searchTerm, selectedCategory, selectedPaymentMethod, sortBy, sortOrder]);

  // Group expenses by date
  const groupedExpenses = useMemo(() => {
    return groupExpensesByDate(filteredExpenses);
  }, [filteredExpenses]);

  const handleDelete = async (expenseId: string) => {
    try {
      deleteExpense(expenseId);
      toast({
        title: "Expense deleted",
        description: "The expense has been successfully removed."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete expense. Please try again.",
        variant: "destructive"
      });
    }
  };

  const toggleSort = (field: 'date' | 'amount' | 'description') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const totalFiltered = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Expense History</h1>
          <p className="text-muted-foreground mt-1">
            {filteredExpenses.length} expenses • {showAmounts ? formatCurrency(totalFiltered) : '••••'}
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

      {/* Filters */}
      <Card className="glass-card">
        <CardContent className="pt-6">
          <div className="flex flex-col space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search expenses..."
                className="pl-10 h-12"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-10">
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="All Categories" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center space-x-2">
                        <span>{category.icon}</span>
                        <span>{category.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="All Payment Methods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payment Methods</SelectItem>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleSort('date')}
                  className={`flex-1 ${sortBy === 'date' ? 'bg-primary/10 text-primary' : ''}`}
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  Date
                  <ArrowUpDown className="h-3 w-3 ml-1" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleSort('amount')}
                  className={`flex-1 ${sortBy === 'amount' ? 'bg-primary/10 text-primary' : ''}`}
                >
                  Amount
                  <ArrowUpDown className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expense List */}
      <div className="space-y-4">
        {Object.keys(groupedExpenses).length > 0 ? (
          Object.entries(groupedExpenses)
            .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
            .map(([date, dayExpenses]) => (
              <Card key={date} className="glass-card animate-slide-up">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold flex items-center justify-between">
                    <span>{formatDateRelative(date)}</span>
                    <span className="text-sm font-normal text-muted-foreground">
                      {showAmounts 
                        ? formatCurrency(dayExpenses.reduce((sum, exp) => sum + exp.amount, 0))
                        : '••••'
                      }
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {dayExpenses.map((expense) => {
                      const category = categories.find(c => c.id === expense.categoryId);
                      return (
                        <div
                          key={expense.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted/70 transition-colors duration-200"
                        >
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-sm"
                              style={{ 
                                backgroundColor: `${category?.color}20`, 
                                color: category?.color 
                              }}
                            >
                              {category?.icon}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{expense.description}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge variant="secondary" className="text-xs">
                                  {category?.name}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {expense.paymentMethod}
                                </Badge>
                                {expense.recurring?.enabled && (
                                  <Badge variant="outline" className="text-xs text-purple-600">
                                    Recurring
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <div className="text-right">
                              <p className="font-semibold text-foreground">
                                {showAmounts ? formatCurrency(expense.amount) : '••••'}
                              </p>
                            </div>
                            
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingExpense(expense)}
                                className="h-8 w-8 p-0 hover:bg-primary/10"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="glass-card">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Expense</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{expense.description}"? 
                                      This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(expense.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))
        ) : (
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted/50 flex items-center justify-center">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No expenses found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || selectedCategory !== 'all' || selectedPaymentMethod !== 'all'
                    ? "Try adjusting your filters to see more results"
                    : "Start tracking your expenses by adding your first expense"
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Expense Modal */}
      {editingExpense && (
        <AddExpenseModal
          isOpen={!!editingExpense}
          onClose={() => setEditingExpense(null)}
          editExpense={editingExpense}
        />
      )}
    </div>
  );
};
