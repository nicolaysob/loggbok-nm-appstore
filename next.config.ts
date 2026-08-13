import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Feltbilder komprimeres i nettleseren, men server action må tåle noen MB
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
  // Unngår blokkert HMR når man åpner 127.0.0.1 i stedet for localhost
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

export default nextConfig;
