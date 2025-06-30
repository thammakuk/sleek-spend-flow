
import React from 'react';

export const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center animate-pulse">
          <span className="text-2xl font-bold text-white">ET</span>
        </div>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">Loading your expenses...</p>
      </div>
    </div>
  );
};
