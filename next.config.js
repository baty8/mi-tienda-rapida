/** @type {import('next').NextConfig} */
const nextConfig = {
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
  env: {
    INTERNAL_API_KEY: process.env.INTERNAL_API_KEY,
  }
};

module.exports = nextConfig;
