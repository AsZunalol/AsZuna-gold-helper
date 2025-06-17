/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "zdjwi6063jgv9afy.public.blob.vercel-storage.com",
        port: "",
        pathname: "/**",
      },
      // This pattern is now simplified to allow any path from this hostname
      {
        protocol: "https",
        hostname: "wow.zamimg.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Permissions-Policy",
            value: "picture-in-picture=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
