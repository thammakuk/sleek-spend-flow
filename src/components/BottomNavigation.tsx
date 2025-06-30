
import { Home, History, TrendingUp, Settings } from "lucide-react";
import { TabType } from "@/pages/Index";

interface BottomNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNavigation = ({ activeTab, onTabChange }: BottomNavigationProps) => {
  const navItems = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: Home },
    { id: 'history' as TabType, label: 'History', icon: History },
    { id: 'insights' as TabType, label: 'Insights', icon: TrendingUp },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass-card rounded-t-3xl border-t border-border/50">
      <div className="flex items-center justify-around py-2 px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`touch-target flex-col space-y-1 transition-all duration-200 rounded-xl p-2 ${
                isActive 
                  ? 'bg-primary/20 text-primary' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <Icon className={`h-5 w-5 mx-auto transition-transform duration-200 ${
                isActive ? 'scale-110' : ''
              }`} />
              <span className={`text-xs font-medium transition-all duration-200 ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
