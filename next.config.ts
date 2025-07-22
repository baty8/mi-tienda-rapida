
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'oucrwfmkjkgvlqbsaqbj.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // Use publicRuntimeConfig to safely expose environment variables to the client-side
  publicRuntimeConfig: {
    // This will be available on both server and client
    isGeminiConfigured: process.env.NEXT_PUBLIC_GEMINI_API_KEY === 'true',
  },
};

export default nextConfig;
