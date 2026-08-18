import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Loggbok – N&M Vaktmesterservice",
    short_name: "Loggbok",
    description: "Loggbok og rapportering for N&M Vaktmesterservice",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    // Må matche --canvas (lys modus) i globals.css, ellers blinker appen
    // i feil farge i det halvsekundet den starter opp fra hjemskjermen.
    background_color: "#f5f3ef",
    theme_color: "#f5f3ef",
    lang: "nb",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
