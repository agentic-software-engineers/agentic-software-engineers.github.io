import { Faq } from "@/components/faq"
import { Hero } from "@/components/hero"
import { Projects } from "@/components/projects"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <Projects />
        <Faq />
      </main>
      <SiteFooter />
    </>
  )
}
