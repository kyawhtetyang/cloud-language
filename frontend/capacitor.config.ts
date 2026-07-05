import type { CapacitorConfig } from '@capacitor/cli';

const prototypeServerUrl =
  process.env.CAPACITOR_SERVER_URL?.trim() || 'https://cloudlanguage.kyawhtet.com';

const config: CapacitorConfig = {
  appId: 'com.kyawhtet.cloudlanguage',
  appName: 'CloudLanguage',
  webDir: 'dist',
  server: {
    url: prototypeServerUrl,
    cleartext: false,
  },
};

export default config;
