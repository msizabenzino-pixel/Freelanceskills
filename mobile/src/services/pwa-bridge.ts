import { Platform } from 'react-native';

export const PWABridgeService = {
  isPWA: () => {
    if (Platform.OS !== 'web') return false;
    return window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
  },

  syncWithPWA: async (data: any) => {
    // Logic to sync mobile data with PWA storage if needed
    console.log('Syncing data with PWA', data);
  },

  handleNativeMessage: (message: string) => {
    // Handle messages from the PWA wrapper if applicable
    console.log('Received message from PWA bridge', message);
  }
};
