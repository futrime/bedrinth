import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Here we use the @cloudflare/next-on-pages next-dev module to allow us to use bindings during local development
// (when running the application with `next dev`), for more information see:
// https://github.com/cloudflare/next-on-pages/blob/main/internal-packages/next-dev/README.md
let cloudflareConfig = {};
if (process.env.NODE_ENV === "development") {
  cloudflareConfig = defineCloudflareConfig()
}



/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["next-mdx-remote"],
};

export default {...cloudflareConfig,...nextConfig};
