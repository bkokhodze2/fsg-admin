/** @type {import('next').NextConfig} */
const nextConfig = {
  crossOrigin: 'anonymous',
  reactStrictMode: true,
  images: {
    domains: [
      "www.google.com",
    ],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
