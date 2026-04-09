import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.officialum1.admin',
  appName: 'OfficialUM1 Admin',
  webDir: 'mobile-build', // Points to fallback index.html
  server: {
    url: 'https://officialum1.com/admin/login', // Correct Entry Point
    cleartext: true, // Allow http for development
    allowNavigation: [
      'officialum1.com',
      '*.officialum1.com',
      'accounts.google.com' // If google login is used
    ]
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#000000", // Dark mode splash
      showSpinner: true,
      androidSpinnerStyle: "large",
      spinnerColor: "#ea580c", // Orange
    }
  }
};

export default config;
