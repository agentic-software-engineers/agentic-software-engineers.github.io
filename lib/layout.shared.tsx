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
      url: "/docs",
    },
    links: [{ text: site.name, url: "/" }],
    githubUrl: site.links.github,
    // dark only, like the landing page
    themeSwitch: { enabled: false },
  }
}
