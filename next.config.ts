import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // ข้ามการตรวจ error ของ TypeScript ตอน Build
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
