
import { Loader2 } from "lucide-react";

export const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <div className="glass-card p-8 max-w-sm mx-auto">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Expense Tracker
          </h2>
          <p className="text-muted-foreground">
            Loading your financial dashboard...
          </p>
        </div>
      </div>
    </div>
  );
};
