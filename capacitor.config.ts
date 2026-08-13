import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "no.nmvaktmester.loggbok",
  appName: "Loggbok",
  webDir: "www",
  // Laster produksjonsappen — samme data som Vercel-web
  server: {
    url: "https://loggbok-nm-lyart.vercel.app",
    cleartext: false,
    allowNavigation: ["loggbok-nm-lyart.vercel.app", "*.vercel.app"],
  },
  ios: {
    contentInset: "automatic",
    preferredContentMode: "mobile",
    scheme: "Loggbok",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 800,
      launchAutoHide: true,
      backgroundColor: "#f5f6f8",
      showSpinner: false,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#f5f6f8",
    },
  },
};

export default config;
