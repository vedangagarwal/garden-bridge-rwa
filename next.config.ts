import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js 16 uses Turbopack by default
  turbopack: {},
  webpack(config) {
    // Enable WebAssembly support (required by tiny-secp256k1 / @gardenfi/core)
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };
    return config;
  },
};

export default nextConfig;
