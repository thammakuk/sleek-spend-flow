
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.44fddb84aa0c430b86ef98126e66f626',
  appName: 'sleek-spend-flow',
  webDir: 'dist',
  server: {
    url: 'https://44fddb84-aa0c-430b-86ef-98126e66f626.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1a1a2e',
      showSpinner: false
    }
  }
};

export default config;
