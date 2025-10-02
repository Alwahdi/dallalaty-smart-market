import type { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'com.alwahdi.matjeribb',
  appName: 'متجر إب الشامل',
  webDir: 'dist',
  server: {
    url: 'https://8d4c67d9-26c7-413c-a5bf-ed16a91b2b6c.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#488AFF'
    }
  }
};

export default config;
