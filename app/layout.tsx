import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Source_Sans_3 } from "next/font/google";
import { AddToHomeScreenPrompt } from "@/components/add-to-home-screen";
import { CapacitorShell } from "@/components/capacitor-shell";
import "./globals.css";

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Kun til tall — timer, datoer og antall skal stå i kolonne
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["500", "600"],
});

export const metadata: Metadata = {
  title: "Loggbok – N&M",
  description: "Loggbok og rapportering for N&M Vaktmesterservice",
  applicationName: "Loggbok",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Loggbok",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#16a34a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="no"
      className={`${sourceSans.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <CapacitorShell />
        <AddToHomeScreenPrompt />
        {children}
      </body>
    </html>
  );
}
