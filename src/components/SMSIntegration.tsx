import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  MessageSquare, 
  ContactRound, 
  Shield, 
  Smartphone, 
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Info
} from "lucide-react";
import { nativeDataService } from "@/services/nativeDataService";
import { useToast } from "@/hooks/use-toast";
import { useExpenses } from "@/hooks/useExpenses";
import { Capacitor } from '@capacitor/core';

export const SMSIntegration = () => {
  const { toast } = useToast();
  const { refreshData } = useExpenses();
  const [isProcessing, setIsProcessing] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState({
    sms: false,
    contacts: false
  });
  const [lastSyncDate, setLastSyncDate] = useState<Date | null>(null);

  const handleRequestPermissions = async () => {
    try {
      const permissions = await nativeDataService.requestPermissions();
      setPermissionsGranted(permissions);
      
      toast({
        title: permissions.sms && permissions.contacts ? "Permissions Granted" : "Partial Permissions",
        description: `SMS: ${permissions.sms ? '✓' : '✗'}, Contacts: ${permissions.contacts ? '✓' : '✗'}`,
        variant: permissions.sms && permissions.contacts ? "default" : "destructive"
      });
    } catch (error) {
      toast({
        title: "Permission Error",
        description: error instanceof Error ? error.message : "Failed to request permissions",
        variant: "destructive"
      });
    }
  };

  const handleSyncExpenses = async () => {
    if (!permissionsGranted.sms) {
      toast({
        title: "SMS Permission Required",
        description: "Please grant SMS permission first to sync expenses.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const result = await nativeDataService.processSMSForExpenses();
      
      if (result.success) {
        setLastSyncDate(new Date());
        await refreshData(); // Refresh the expenses data
        
        toast({
          title: "Sync Complete",
          description: `Successfully processed ${result.processedCount} expense${result.processedCount !== 1 ? 's' : ''} from SMS.`,
        });
      } else {
        toast({
          title: "Sync Failed",
          description: result.error || "Failed to process SMS messages",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Sync Error",
        description: error instanceof Error ? error.message : "Failed to sync expenses",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const isNativePlatform = Capacitor.isNativePlatform();

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Smartphone className="h-5 w-5 text-primary" />
            <span>Smart Expense Detection</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isNativePlatform && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                SMS and Contacts integration is only available on mobile devices. 
                Please use the mobile app to access these features.
              </AlertDescription>
            </Alert>
          )}

          {isNativePlatform && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* SMS Permission Card */}
                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="h-4 w-4" />
                      <span className="font-medium">SMS Access</span>
                    </div>
                    <Badge variant={permissionsGranted.sms ? "default" : "secondary"}>
                      {permissionsGranted.sms ? "Granted" : "Required"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Read bank transaction SMS to automatically detect and categorize expenses.
                  </p>
                </div>

                {/* Contacts Permission Card */}
                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <ContactRound className="h-4 w-4" />
                      <span className="font-medium">Contacts Access</span>
                    </div>
                    <Badge variant={permissionsGranted.contacts ? "default" : "secondary"}>
                      {permissionsGranted.contacts ? "Granted" : "Required"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Identify bank and merchant contacts for better transaction categorization.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={handleRequestPermissions}
                  variant="outline"
                  className="flex-1"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Grant Permissions
                </Button>
                
                <Button 
                  onClick={handleSyncExpenses}
                  disabled={!permissionsGranted.sms || isProcessing}
                  className="flex-1"
                >
                  {isProcessing ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <MessageSquare className="h-4 w-4 mr-2" />
                  )}
                  {isProcessing ? "Syncing..." : "Sync Expenses from SMS"}
                </Button>
              </div>

              {lastSyncDate && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  Last synced: {lastSyncDate.toLocaleString()}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Privacy Notice */}
      <Card className="glass-card border-amber-200/50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-800 dark:text-amber-200">Privacy Notice</h4>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                Your SMS and contact data is processed locally on your device and only transaction-related 
                information is sent to our secure servers for expense categorization. We never store or 
                access personal messages or contact details.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Supported Banks & Services */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg">Supported Banks & Services</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              'HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank',
              'Kotak Bank', 'Paytm', 'Google Pay', 'PhonePe',
              'Amazon Pay', 'Bharatpe', 'CRED', 'Mobikwik'
            ].map((service) => (
              <Badge key={service} variant="outline" className="justify-center py-2">
                {service}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};