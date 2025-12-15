import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for better packaging
  output: 'standalone',
  // Optimize for production
  compress: true,
  // Disable source maps in production for smaller size
  productionBrowserSourceMaps: false,
};

export default nextConfig;
