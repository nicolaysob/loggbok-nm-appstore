import type { Metadata, Viewport } from "next";
import {
  Bricolage_Grotesque,
  IBM_Plex_Mono,
  Plus_Jakarta_Sans,
} from "next/font/google";
import { AddToHomeScreenPrompt } from "@/components/add-to-home-screen";
import { CapacitorShell } from "@/components/capacitor-shell";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["500", "600"],
});

// Kun til overskrifter — brødteksten beholder Jakarta
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

/** Aksentfargen følger arbeidsåret — se årstidsblokka i globals.css. */
function osloSeason(): "vinter" | "vaar" | "sommer" | "host" {
  const month = Number(
    new Intl.DateTimeFormat("en-US", {
      month: "numeric",
      timeZone: "Europe/Oslo",
    }).format(new Date()),
  );
  if (month === 12 || month <= 2) return "vinter";
  if (month <= 5) return "vaar";
  if (month <= 8) return "sommer";
  return "host";
}

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
  // Må matche --canvas i globals.css, ellers blinker statuslinja i
  // feil farge når appen åpnes.
  themeColor: "#f5f3ef",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="no"
      data-season={osloSeason()}
      className={`${jakarta.variable} ${plexMono.variable} ${bricolage.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <CapacitorShell />
        <AddToHomeScreenPrompt />
        {children}
      </body>
    </html>
  );
}
