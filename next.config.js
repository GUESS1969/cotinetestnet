/** @type {import('next').NextConfig} */
const nextConfig = {
  
  output: 'standalone',
  reactStrictMode: true,
  webpack: (config) => {
    config.experiments = { 
      asyncWebAssembly: true,
      topLevelAwait: true,
      layers: true
    }
    return config
  },
    env:{
    BLOCKFROST_KEY: process.env.NEXT_PUBLIC_BLOCKFROST_KEY_PREPROD,
    API_URL: process.env.API_URL_PREPROD,
    NETWORK: process.env.NEXT_PUBLIC_NETWORK_ENV
  }
}

module.exports = nextConfig
