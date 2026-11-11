import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // Add the DMS / image CDN hosts that serve vehicle photos.
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "**.imgix.net" },
      // Instagram feed thumbnails (see src/lib/instagram.ts).
      { protocol: "https", hostname: "**.cdninstagram.com" },
      { protocol: "https", hostname: "**.fbcdn.net" },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Old site → new IA. Vehicle detail pages are handled by app/vehicle/[slug]/route.ts.
  async redirects() {
    return [
      { source: "/vehicle/luxury-cars", destination: "/cars", permanent: true },
      { source: "/vehicle/meridian-boutique", destination: "/cars", permanent: true },
      { source: "/luxury-cars", destination: "/cars", permanent: true },
      { source: "/about-us", destination: "/about", permanent: true },
      { source: "/help-contact", destination: "/contact", permanent: true },
      { source: "/sell-car", destination: "/sell", permanent: true },
      { source: "/car-service", destination: "/service", permanent: true },
      { source: "/wholesale-partner", destination: "/contact", permanent: true },
      { source: "/privacy-policy", destination: "/privacy", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
