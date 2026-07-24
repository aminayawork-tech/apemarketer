import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.apemarketer",
  appName: "Ape Marketer",
  // Points to live production site — web updates deploy instantly without a new store build
  server: {
    url: "https://www.apemarketer.app/app",
    cleartext: false,
  },
  ios: {
    contentInset: "automatic",
    backgroundColor: "#F2EDE4",
    preferredContentMode: "mobile",
    scrollEnabled: true,
  },
  android: {
    backgroundColor: "#F2EDE4",
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
    },
  },
};

export default config;
