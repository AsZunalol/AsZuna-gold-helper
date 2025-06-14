// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... existing configurations like 'images'
  images: {
    //
    remotePatterns: [
      {
        protocol: "https",
        hostname: "zdjwi6063jgv9afy.public.blob.vercel-storage.com",
        port: "",
        pathname: "/**",
      },
      // ... other remote patterns
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*", // Apply to all paths
        headers: [
          {
            key: "Permissions-Policy",
            // Explicitly allow picture-in-picture. You can add other features here as needed.
            // Be mindful of security when setting this header.
            value: "picture-in-picture=()", // Allow picture-in-picture for all origins
            // OR to allow only specific origins: 'picture-in-picture=(self "https://www.youtube.com")'
          },
        ],
      },
    ];
  },
};

export default nextConfig;
