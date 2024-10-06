/** @type {import('next').NextConfig} */
const nextConfig = {
  images:{
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dkeoatbydmlowovtnbxh.supabase.co'
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com'
      }
    ]  
  }
};

export default nextConfig;
