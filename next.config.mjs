/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production configuration
  output: 'standalone',
   
  // Image configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com',
      },
      // Add your domains here
    ],
    unoptimized: false,
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },
  
  // Deployment configuration
  trailingSlash: false,
  
  // Public environment variables
  env: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  },
  
  // Output file tracing configuration
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
