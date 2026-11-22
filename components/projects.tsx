import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import { Clamp } from "@/components/clamp"

const org = "agentic-software-engineers"
const projects = [
  { name: "Open Secure Software Suite", repo: "o3s" },
  { name: "Dev Container Features", repo: "devcontainer-features" },
]

// descriptions come from each repository on GitHub
async function description(repo: string) {
  const token = process.env.GITHUB_TOKEN
  const res = await fetch(`https://api.github.com/repos/${org}/${repo}`, {
    headers: { Accept: "application/vnd.github+json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  })
  if (!res.ok) throw new Error(`GitHub API ${res.status} for ${org}/${repo}`)
  const data: { description: string | null } = await res.json()
  return data.description ?? ""
}

// each project is a container from the logo's cargo: a face with a lid above and an end beside it
export async function Projects() {
  const items = await Promise.all(
    projects.map(async (p) => ({ ...p, href: `https://github.com/${org}/${p.repo}`, description: await description(p.repo) })),
  )
  return (
    <section id="projects" className="mx-auto max-w-[1200px] scroll-mt-14 px-6 py-24">
      <h2 className="text-3xl font-semibold tracking-tight">Projects</h2>
      <div className="mt-10 grid auto-rows-fr gap-x-10 gap-y-10 md:grid-cols-2">
        {items.map((project) => (
          <Link
            key={project.name}
            href={project.href}
            target="_blank"
            rel="noreferrer"
            className="group relative mt-5 mr-6 block focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            {/* lid and end: faces in perspective (18 across, 14 up), each 4px from the front and from each other */}
            <span
              aria-hidden="true"
              className="absolute -top-[18px] left-0 h-3.5 w-[calc(100%+19.9px)] bg-linear-to-r from-[#9ef0e3] to-[#7ce9da] [clip-path:polygon(0_14px,18px_0,100%_0,calc(100%-18px)_14px)]"
            />
            <span
              aria-hidden="true"
              className="absolute -top-[14.6px] bottom-0 left-[calc(100%+4px)] w-[18px] bg-linear-to-b from-[#2589b5] to-[#1b5f86] [clip-path:polygon(0_14px,18px_0,18px_calc(100%-14px),0_100%)]"
            />
            <div className="relative h-full bg-linear-to-br from-[#4bdfcb] via-[#27bbe5] via-60% to-[#3798dc] p-6 pr-16 text-[#0d0f0f] transition-transform duration-200 group-hover:-translate-y-0.5 md:p-7 md:pr-20">
              {/* the arrow stays with the name's last word, so it never wraps onto a line of its own */}
              <div className="text-lg leading-snug font-bold">
                {project.name.split(" ").slice(0, -1).join(" ")}{" "}
                <span className="whitespace-nowrap">
                  {project.name.split(" ").at(-1)}
                  <ArrowUpRight aria-hidden="true" className="ml-1.5 inline size-4 -translate-y-px align-middle" />
                </span>
              </div>
              <p className="mt-2 text-base leading-relaxed text-[#0d2a33]">
                <Clamp text={project.description} lines={3} />
              </p>
              {/* the container's doors: three ribs at its right end */}
              <span aria-hidden="true" className="absolute top-5 right-5 bottom-5 flex gap-2">
                <i className="w-0.5 bg-[#0d0f0f]/25" />
                <i className="w-0.5 bg-[#0d0f0f]/25" />
                <i className="w-0.5 bg-[#0d0f0f]/25" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
