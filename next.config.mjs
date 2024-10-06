/** @type {import('next').NextConfig} */
const nextConfig = {
  images:{
    remotePatterns: [{
      protocol: 'https',
      hostname: 'dkeoatbydmlowovtnbxh.supabase.co'
    }]
  }
};

export default nextConfig;
