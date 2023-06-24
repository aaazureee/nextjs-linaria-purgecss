/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

const withLinaria = require('./next-linaria-custom');

module.exports = withLinaria({
  ...nextConfig
})