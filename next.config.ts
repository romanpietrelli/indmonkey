import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co", // Cubre cualquier proyecto de Supabase Storage
      },
      {
        protocol: "https",
        hostname: "*.supabase.in", // Region mirrors
      }
    ],
  },
};

export default nextConfig;
