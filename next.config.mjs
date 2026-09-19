/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // WebP is broadly supported and noticeably faster to generate than AVIF
    // on a first request, which keeps image-heavy listing pages responsive.
    formats: ["image/webp"],
    minimumCacheTTL: 2592000,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

export default nextConfig;
