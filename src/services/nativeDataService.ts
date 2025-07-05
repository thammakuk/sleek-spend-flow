import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';

// Define interfaces for native data
interface SMSMessage {
  address: string;
  body: string;
  date: number;
  type: number;
}

interface Contact {
  contactId: string;
  displayName: string;
  phoneNumbers: string[];
  emails: string[];
}

export class NativeDataService {
  private static instance: NativeDataService;

  static getInstance(): NativeDataService {
    if (!NativeDataService.instance) {
      NativeDataService.instance = new NativeDataService();
    }
    return NativeDataService.instance;
  }

  async requestPermissions(): Promise<{ sms: boolean; contacts: boolean }> {
    if (!Capacitor.isNativePlatform()) {
      throw new Error('SMS and Contacts access is only available on mobile devices. Please use the mobile app.');
    }

    try {
      // Request SMS permission
      const smsPermission = await this.requestSMSPermission();
      
      // Request Contacts permission  
      const contactsPermission = await this.requestContactsPermission();

      return {
        sms: smsPermission,
        contacts: contactsPermission
      };
    } catch (error) {
      console.error('Error requesting permissions:', error);
      throw error;
    }
  }

  private async requestSMSPermission(): Promise<boolean> {
    try {
      // This would need a Capacitor plugin for SMS access
      // For now, we'll simulate the permission request
      if (Capacitor.getPlatform() === 'android') {
        // On Android, we can request SMS permissions
        return true; // Placeholder - would need actual plugin
      }
      return false;
    } catch (error) {
      console.error('SMS permission error:', error);
      return false;
    }
  }

  private async requestContactsPermission(): Promise<boolean> {
    try {
      // This would need a Capacitor plugin for Contacts access
      // For now, we'll simulate the permission request
      return true; // Placeholder - would need actual plugin
    } catch (error) {
      console.error('Contacts permission error:', error);
      return false;
    }
  }

  async readSMSMessages(limit: number = 100): Promise<SMSMessage[]> {
    if (!Capacitor.isNativePlatform()) {
      throw new Error('SMS reading is only available on mobile devices');
    }

    try {
      // This would use a Capacitor SMS plugin to read messages
      // For web demo, we'll return mock data
      const mockSMSData: SMSMessage[] = [
        {
          address: 'HDFCBK',
          body: 'Rs 2,500 debited from your account ending 1234 for payment at RELIANCE PETROL PUMP on 05-Jan-25. Available balance: Rs 45,230.50',
          date: Date.now() - 86400000, // 1 day ago
          type: 1
        },
        {
          address: 'PAYTM',
          body: 'Rs 150 paid to DOMINOS PIZZA via Paytm. Transaction ID: 12345678. Cashback of Rs 15 credited.',
          date: Date.now() - 172800000, // 2 days ago
          type: 1
        },
        {
          address: 'ICICIBK',
          body: 'UPI payment of Rs 89 made to Amazon Pay for shopping. Transaction ID: 987654321',
          date: Date.now() - 259200000, // 3 days ago
          type: 1
        }
      ];

      return mockSMSData;
    } catch (error) {
      console.error('Error reading SMS:', error);
      throw error;
    }
  }

  async readContacts(limit: number = 50): Promise<Contact[]> {
    if (!Capacitor.isNativePlatform()) {
      throw new Error('Contacts reading is only available on mobile devices');
    }

    try {
      // This would use a Capacitor Contacts plugin
      // For web demo, we'll return mock data
      const mockContacts: Contact[] = [
        {
          contactId: '1',
          displayName: 'HDFC Bank',
          phoneNumbers: ['HDFCBK'],
          emails: []
        },
        {
          contactId: '2', 
          displayName: 'ICICI Bank',
          phoneNumbers: ['ICICIBK'],
          emails: []
        },
        {
          contactId: '3',
          displayName: 'Paytm',
          phoneNumbers: ['PAYTM'],
          emails: []
        }
      ];

      return mockContacts;
    } catch (error) {
      console.error('Error reading contacts:', error);
      throw error;
    }
  }

  async processSMSForExpenses(): Promise<{ success: boolean; processedCount: number; error?: string }> {
    try {
      // Read SMS messages
      const smsMessages = await this.readSMSMessages(50);
      
      // Filter for transaction-related messages (last 30 days)
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      const recentTransactionSMS = smsMessages.filter(sms => 
        sms.date > thirtyDaysAgo && this.isTransactionSMS(sms.body, sms.address)
      );

      if (recentTransactionSMS.length === 0) {
        return { success: true, processedCount: 0 };
      }

      // Send to Edge Function for processing
      const { data, error } = await supabase.functions.invoke('sms-expense-parser', {
        body: { smsMessages: recentTransactionSMS }
      });

      if (error) {
        console.error('Error processing SMS:', error);
        return { success: false, processedCount: 0, error: error.message };
      }

      return {
        success: true,
        processedCount: data.insertedExpenses || 0
      };

    } catch (error) {
      console.error('Error in processSMSForExpenses:', error);
      return {
        success: false,
        processedCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private isTransactionSMS(message: string, address: string): boolean {
    const text = message.toLowerCase();
    const sender = address.toLowerCase();
    
    const bankSenders = ['hdfc', 'icici', 'sbi', 'axis', 'kotak', 'paytm', 'gpay', 'phonepe'];
    const transactionKeywords = ['debited', 'credited', 'paid', 'spent', 'transaction', 'purchase'];
    
    const isFromBank = bankSenders.some(bank => sender.includes(bank));
    const hasTransactionKeyword = transactionKeywords.some(keyword => text.includes(keyword));
    
    return isFromBank && hasTransactionKeyword;
  }

  async installRequiredPlugins(): Promise<string[]> {
    const requiredPlugins = [];
    
    if (Capacitor.isNativePlatform()) {
      // Check if SMS plugin is available
      try {
        // This would check for @capacitor-community/sms plugin
        requiredPlugins.push('@capacitor-community/sms');
      } catch (error) {
        // SMS plugin not available
      }

      // Check if Contacts plugin is available
      try {
        // This would check for @capacitor-community/contacts plugin  
        requiredPlugins.push('@capacitor-community/contacts');
      } catch (error) {
        // Contacts plugin not available
      }
    }

    return requiredPlugins;
  }
}

export const nativeDataService = NativeDataService.getInstance();