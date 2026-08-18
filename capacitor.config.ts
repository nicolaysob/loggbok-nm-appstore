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
      // Må matche --canvas (lys modus) i app/globals.css
      backgroundColor: "#f5f3ef",
      showSpinner: false,
    },
    StatusBar: {
      overlaysWebView: false,
      // Startverdi — CapacitorShell bytter til mørk når telefonen er i mørk modus
      style: "LIGHT",
      backgroundColor: "#f5f3ef",
    },
  },
};

export default config;
