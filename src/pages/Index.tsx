
import { useState, useEffect } from "react";
import { Dashboard } from "@/components/Dashboard";
import { ExpenseHistory } from "@/components/ExpenseHistory";
import { Insights } from "@/components/Insights";
import { Settings } from "@/components/Settings";
import { BudgetManager } from "@/components/BudgetManager";
import { AuthModal } from "@/components/AuthModal";
import { AddExpenseModal } from "@/components/AddExpenseModal";
import { BottomNavigation } from "@/components/BottomNavigation";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import { LoadingScreen } from "@/components/LoadingScreen";

export type TabType = 'dashboard' | 'history' | 'insights' | 'budgets' | 'settings';

const Index = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setShowAuthModal(true);
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-background">
          <AuthModal 
            isOpen={showAuthModal} 
            onClose={() => setShowAuthModal(false)}
          />
        </div>
      </ThemeProvider>
    );
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'history':
        return <ExpenseHistory />;
      case 'insights':
        return <Insights />;
      case 'budgets':
        return <BudgetManager />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground">
        {/* Main Content */}
        <main className="pb-20 min-h-screen">
          <div className="animate-fade-in">
            {renderActiveTab()}
          </div>
        </main>

        {/* Floating Action Button */}
        <FloatingActionButton onClick={() => setShowAddExpense(true)} />

        {/* Bottom Navigation */}
        <BottomNavigation 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />

        {/* Add Expense Modal */}
        <AddExpenseModal 
          isOpen={showAddExpense}
          onClose={() => setShowAddExpense(false)}
        />
      </div>
    </ThemeProvider>
  );
};

export default Index;
