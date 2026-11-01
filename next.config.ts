import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // The database setup reads these SQL files at runtime, so hosting must include them.
  outputFileTracingIncludes: { "/**": ["./db/**"] },
};

export default nextConfig;
