@type {import('next').NextConfig}
const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig

module.exports = {
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    MONGODB_DB: process.env.MONGODB_DB,
  },
};
