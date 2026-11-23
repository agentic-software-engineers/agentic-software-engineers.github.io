import { Faq } from "@/components/faq"
import { ForceDark } from "@/components/force-dark"
import { Hero } from "@/components/hero"
import { Projects } from "@/components/projects"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"

export default function Page() {
  return (
    <>
      <ForceDark />
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
