
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Moon, 
  Sun, 
  LogOut,
  Camera,
  Languages
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export const Settings = () => {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [budgetAlerts, setBudgetAlerts] = useState(true);

  const languageOptions: { value: Language; label: string; native: string }[] = [
    { value: 'en', label: 'English', native: 'English' },
    { value: 'hi', label: 'Hindi', native: 'हिन्दी' },
    { value: 'ta', label: 'Tamil', native: 'தமிழ்' },
    { value: 'te', label: 'Telugu', native: 'తెలుగు' },
    { value: 'ml', label: 'Malayalam', native: 'മലയാളം' },
    { value: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
    { value: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
    { value: 'mr', label: 'Marathi', native: 'मराठी' },
    { value: 'bn', label: 'Bengali', native: 'বাংলা' },
    { value: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive"
      });
    }
  };

  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  const userEmail = user?.email || '';
  const userAvatar = user?.user_metadata?.avatar_url;
  const authProvider = user?.app_metadata?.provider || 'email';

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center space-x-3 mb-6">
        <SettingsIcon className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">{t('settings')}</h1>
      </div>

      {/* Profile Section */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>{t('profile')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              {userAvatar ? (
                <img 
                  src={userAvatar} 
                  alt="Profile" 
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
              )}
              <Button 
                size="sm" 
                variant="outline" 
                className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full p-0"
              >
                <Camera className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex-1">
              <div className="space-y-2">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input 
                    id="name" 
                    value={userName}
                    readOnly
                    className="bg-muted"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    value={userEmail}
                    readOnly
                    className="bg-muted"
                  />
                </div>
                <div>
                  <Label>Provider</Label>
                  <p className="text-sm text-muted-foreground capitalize">
                    {authProvider}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Language Settings */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Languages className="h-5 w-5" />
            <span>{t('language')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="language-select">Select Language</Label>
            <Select value={language} onValueChange={(value: Language) => setLanguage(value)}>
              <SelectTrigger id="language-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languageOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center space-x-2">
                      <span>{option.label}</span>
                      <span className="text-muted-foreground">({option.native})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Appearance Settings */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            <span>Appearance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="theme-select">Theme</Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger id="theme-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Notifications</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifications">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications about your expenses and budgets
              </p>
            </div>
            <Switch 
              id="notifications"
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="budget-alerts">Budget Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when you're close to your budget limits
              </p>
            </div>
            <Switch 
              id="budget-alerts"
              checked={budgetAlerts}
              onCheckedChange={setBudgetAlerts}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Security</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              Change Password
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Two-Factor Authentication
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Privacy Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logout */}
      <Card className="glass-card border-destructive/20">
        <CardContent className="pt-6">
          <Button 
            variant="destructive" 
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            {t('logout')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
