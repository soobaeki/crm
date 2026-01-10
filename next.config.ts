import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["images.unsplash.com"],
  },
  typescript: {
    // 타입 에러가 있어도 빌드를 멈추지 않고 강제로 진행합니다.
    ignoreBuildErrors: true,
  },
  eslint: {
    // ESLint 에러가 있어도 빌드를 진행합니다.
    ignoreDuringBuilds: true,
  },
};
export default nextConfig;
