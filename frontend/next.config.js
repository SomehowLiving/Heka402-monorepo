/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Disable Turbopack to avoid the "webpack config but no turbopack config" error
  experimental: {
    turbo: false
  },

  webpack: (config, { isServer }) => {
    // Fallbacks for Node.js modules that don't exist in the browser
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      '@react-native-async-storage/async-storage': false,
    };

    // Handle snarkjs and related dependencies for browser builds
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
        stream: false,
        buffer: false,
      };
    }

    return config;
  },
};

module.exports = nextConfig;
