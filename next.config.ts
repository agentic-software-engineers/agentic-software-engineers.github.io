import type { NextConfig } from "next"
import { createMDX } from "fumadocs-mdx/next"

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
}

// MDX for the docs under /docs
export default createMDX()(nextConfig)
