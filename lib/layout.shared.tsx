import Image from "next/image"
import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared"

import { site } from "@/lib/site"

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <>
          <Image src="/logo.svg" alt="" width={24} height={24} />
          Docs
        </>
      ),
      // the logo leads back to the landing page
      url: "/",
    },
    // the docs overview, reachable from every product
    links: [{ text: "Overview", url: "/docs" }],
    githubUrl: site.links.github,
  }
}
