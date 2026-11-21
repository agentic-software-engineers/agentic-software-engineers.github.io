import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const projects = [
  {
    name: "Open Secure Software Suite (o3s)",
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

export function Projects() {
  return (
    <section id="projects" className="mx-auto max-w-[1200px] scroll-mt-14 px-6 py-24">
      <h2 className="text-3xl font-semibold tracking-tight">Projects</h2>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {projects.map((project) => (
          <Link
            key={project.name}
            href={project.href}
            target="_blank"
            rel="noreferrer"
            className="group rounded-xl focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <Card className="h-full transition-colors group-hover:border-primary/60">
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-4 text-lg leading-snug">
                  {project.name}
                  <ArrowUpRight className="size-4 text-muted-foreground transition-colors group-hover:text-primary" />
                </CardTitle>
                <CardDescription className="text-base">
                  {project.description}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
