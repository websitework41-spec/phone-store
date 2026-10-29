import type { NextConfig } from "next";

const securityHeaders = [
  // Anti-Clickjacking: Disallows embedding this website in iframes on any other domain
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  // Anti-MIME Sniffing: Prevents browsers from guessing file MIME types and executing malicious files
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  // XSS Protection for legacy browsers
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  // Referrer Policy: Prevents leaking sensitive URL query parameters across origins
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  // Permissions Policy: Prohibits unauthorized device hardware access (camera, microphone, geolocation)
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=(), interest-cohort=()",
  },
  // Strict Transport Security (HSTS): Enforces HTTPS connection for 2 years with subdomains
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // DNS Prefetch Control: Speeds up DNS lookups for CDN assets while preventing DNS leakage
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  // Content Security Policy (CSP): Blocks malicious script injection, unauthorized iframes & external data exfiltration
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data: https:",
      "connect-src 'self' https:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // Speed & Security: Hides "X-Powered-By: Next.js" to prevent framework & version fingerprinting
  poweredByHeader: false,

  // Speed: Enable Gzip / Brotli response compression
  compress: true,

  // Best practice: Enable React Strict Mode
  reactStrictMode: true,

  // Performance: Optimize tree-shaking for icons and utility libraries to minimize JS payload
  experimental: {
    optimizePackageImports: ["lucide-react", "clsx", "tailwind-merge"],
  },

  // Image optimization & security
  images: {
    unoptimized: true,
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.priceoye.pk",
      },
      {
        protocol: "https",
        hostname: "**.priceoye.pk",
      },
      {
        protocol: "https",
        hostname: "cdn.vox-cdn.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // Apply HTTP Security Headers and Long-Term Static Asset Caching
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        // Enable long-term immutable caching for static assets (images, fonts, scripts)
        source: "/(.*)\\.(ico|png|jpg|jpeg|svg|webp|avif|woff|woff2|ttf)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
