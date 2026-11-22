import Image from "next/image"
import Link from "next/link"

import { GitHubIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { ScrollProgress } from "@/components/ui/scroll-progress"
import { site } from "@/lib/site"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur">
      {/* how far through the page, right under the navbar */}
      <ScrollProgress className="top-14 h-[3px] from-[#4bdfcb] via-[#27bbe5] to-[#3798dc] shadow-[0_0_10px_#27bbe5]" />
      <div className="mx-auto flex h-14 max-w-[1200px] items-center gap-2 px-6">
        <Link href="/" className="mr-auto flex items-center gap-2 font-semibold">
          <Image src="/logo.svg" alt="" width={28} height={28} priority />
          ASE
        </Link>
        <nav className="flex items-center">
          {site.nav.map((item) => (
            <Button key={item.href} variant="ghost" size="sm" asChild>
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </nav>
        <Button variant="ghost" size="icon" asChild>
          <Link href={site.links.github} target="_blank" rel="noreferrer">
            <GitHubIcon className="size-4" />
            <span className="sr-only">GitHub</span>
          </Link>
        </Button>
      </div>
    </header>
  )
}
