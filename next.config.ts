import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // The stylesheet is small and render blocking; inlining it removes a round
  // trip before the desktop can paint.
  experimental: { inlineCss: true },
}

export default nextConfig
