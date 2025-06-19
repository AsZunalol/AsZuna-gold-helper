/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "zdjwi6063jgv9afy.public.blob.vercel-storage.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "wow.zamimg.com",
        port: "",
        pathname: "/**",
      },
      // THIS IS THE CRITICAL LINE THAT MUST BE INCLUDED
      {
        protocol: "https",
        hostname: "render.worldofwarcraft.com",
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
