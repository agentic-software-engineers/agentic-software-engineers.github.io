import { Faq } from "@/components/faq"
import { Hero } from "@/components/hero"
import { Products } from "@/components/products"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <Products />
        <Faq />
      </main>
      <SiteFooter />
    </>
  )
}
