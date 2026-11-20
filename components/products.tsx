import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const products = [
  {
    name: "o3s",
    description:
      "A plug-and-play dev container for all your projects, and the AI agents building them. Locked down by default.",
    href: "https://github.com/agentic-software-engineers/o3s",
  },
  {
    name: "Dev Container Features",
    description:
      "A collection of reusable dev container features to be dropped into any devcontainer.json.",
    href: "https://github.com/agentic-software-engineers/devcontainer-features",
  },
]

export function Products() {
  return (
    <section id="products" className="mx-auto max-w-[1200px] scroll-mt-14 px-6 py-24">
      <h2 className="text-3xl font-semibold tracking-tight">Products</h2>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {products.map((product) => (
          <Link
            key={product.name}
            href={product.href}
            target="_blank"
            rel="noreferrer"
            className="group rounded-xl focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <Card className="h-full transition-colors group-hover:border-primary/60">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-lg">
                  {product.name}
                  <ArrowUpRight className="size-4 text-muted-foreground transition-colors group-hover:text-primary" />
                </CardTitle>
                <CardDescription className="text-base">
                  {product.description}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
