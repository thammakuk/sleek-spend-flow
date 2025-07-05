
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Plus, 
  Target, 
  TrendingUp, 
  AlertTriangle,
  Edit,
  Trash2
} from "lucide-react";
import { useExpenses, Budget } from "@/hooks/useExpenses";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

export const BudgetManager = () => {
  const { budgets, categories, addBudget, updateBudget, deleteBudget, getBudgetProgress } = useExpenses();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [formData, setFormData] = useState({
    categoryId: 'overall',
    limit: '',
    period: 'monthly' as 'monthly' | 'yearly'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.limit || parseFloat(formData.limit) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid budget amount",
        variant: "destructive"
      });
      return;
    }

    try {
      const budgetData = {
        categoryId: formData.categoryId === 'overall' ? undefined : formData.categoryId,
        limit: parseFloat(formData.limit),
        period: formData.period
      };

      if (editingBudget) {
        await updateBudget(editingBudget.id, budgetData);
        toast({
          title: t('budgetUpdated') || "Budget updated",
          description: "Your budget has been successfully updated."
        });
      } else {
        await addBudget(budgetData);
        toast({
          title: t('budgetCreated') || "Budget created", 
          description: "Your new budget has been created."
        });
      }

      setFormData({ categoryId: 'overall', limit: '', period: 'monthly' });
      setIsAddDialogOpen(false);
      setEditingBudget(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save budget. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setFormData({
      categoryId: budget.categoryId || 'overall',
      limit: budget.limit.toString(),
      period: budget.period
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (budgetId: string) => {
    try {
      await deleteBudget(budgetId);
      toast({
        title: "Budget deleted",
        description: "The budget has been successfully removed."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete budget. Please try again.",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({ categoryId: 'overall', limit: '', period: 'monthly' });
    setEditingBudget(null);
  };

  const overallProgress = getBudgetProgress();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('budgetManager')}</h1>
          <p className="text-muted-foreground mt-1">Track and manage your spending limits</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="touch-target">
              <Plus className="h-4 w-4 mr-2" />
              {t('addBudget')}
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card">
            <DialogHeader>
              <DialogTitle>
                {editingBudget ? t('editBudget') : t('createBudget')}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">{t('category')} (Optional)</label>
                <Select 
                  value={formData.categoryId} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('overallBudget') + " or select category"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="overall">{t('overallBudget')}</SelectItem>
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
              </div>

              <div>
                <label className="text-sm font-medium">{t('budgetLimit')}</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Enter budget limit"
                  value={formData.limit}
                  onChange={(e) => setFormData(prev => ({ ...prev, limit: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Period</label>
                <Select 
                  value={formData.period} 
                  onValueChange={(value: 'monthly' | 'yearly') => setFormData(prev => ({ ...prev, period: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">{t('monthly')}</SelectItem>
                    <SelectItem value="yearly">{t('yearly')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingBudget ? t('update') + ' Budget' : t('create') + ' Budget'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  {t('cancel')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overall Budget Summary */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-primary" />
            <span>{t('overallBudget')} Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Budget</p>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(overallProgress.budget)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Spent</p>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(overallProgress.spent)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Allocated</p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(overallProgress.allocated || 0)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Remaining</p>
              <p className={`text-2xl font-bold ${overallProgress.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(overallProgress.remaining)}
              </p>
            </div>
          </div>
          
          {overallProgress.unallocated !== undefined && overallProgress.budget > 0 && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Unallocated Budget:</span>
                <span className="font-medium text-foreground">
                  {formatCurrency(overallProgress.unallocated)}
                </span>
              </div>
            </div>
          )}
          
          {overallProgress.budget > 0 && (
            <div className="mt-4">
              <Progress value={overallProgress.percentage} className="h-3" />
              <p className="text-sm text-muted-foreground mt-2 text-center">
                {overallProgress.percentage.toFixed(1)}% of total budget used
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Budget List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgets.map((budget) => {
          const category = categories.find(c => c.id === budget.categoryId);
          const progress = getBudgetProgress(budget.categoryId);
          const isOverBudget = progress.spent > budget.limit;
          const isNearLimit = progress.percentage > 80;

          return (
            <Card key={budget.id} className="glass-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {category ? (
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${category.color}20`, color: category.color }}
                      >
                        {category.icon}
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                        <Target className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-lg">
                        {category ? category.name : t('overallBudget')}
                      </CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {t(budget.period)}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(budget)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(budget.id)}
                      className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Spent</span>
                    <span className="font-medium">{formatCurrency(progress.spent)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Budget</span>
                    <span className="font-medium">{formatCurrency(budget.limit)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Remaining</span>
                    <span className={`font-medium ${progress.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(progress.remaining)}
                    </span>
                  </div>
                  
                  <Progress 
                    value={Math.min(progress.percentage, 100)} 
                    className={`h-2 ${isOverBudget ? 'bg-red-100' : isNearLimit ? 'bg-orange-100' : ''}`}
                  />
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {progress.percentage.toFixed(1)}% used
                    </span>
                    {isOverBudget && (
                      <div className="flex items-center text-red-600">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Over budget
                      </div>
                    )}
                    {isNearLimit && !isOverBudget && (
                      <div className="flex items-center text-orange-600">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Near limit
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {budgets.length === 0 && (
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Target className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No budgets created</h3>
              <p className="text-muted-foreground mb-6">
                Create your first budget to start tracking your spending limits
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {t('createBudget')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
