import Link from "next/link"

import { HeroSceneLoader } from "@/components/hero-scene-loader"
import { site } from "@/lib/site"

export function Hero() {
  return (
    <section className="relative flex flex-col overflow-hidden bg-background xl:block xl:h-[calc(100svh-3.5rem)] xl:min-h-[640px]">
      <div className="relative h-[410px] md:h-[480px] xl:absolute xl:inset-0 xl:h-auto">
        <HeroSceneLoader />
        {/* the sea fades out at the bottom, and behind the text on the left where both sit side by side */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_70%,var(--background))] xl:bg-[linear-gradient(180deg,transparent_78%,var(--background)),linear-gradient(90deg,var(--background)_0%,var(--background)_30%,color-mix(in_oklab,var(--background)_85%,transparent)_42%,transparent_62%)]" />
      </div>
      <div className="relative z-10 mx-auto flex w-full max-w-[1200px] px-6 pb-12 xl:h-full xl:items-center xl:pb-0">
        <div
          className="max-w-[640px] [opacity:calc(1-var(--hero-scroll,0)*2.2)] [transform:translateY(calc(var(--hero-scroll,0)*-160px))]"
        >
          <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase md:text-sm">{site.name}</p>
          <h1 className="mt-3 text-[34px] leading-[40px] font-bold tracking-[-0.025em] whitespace-pre-line md:text-[48px] md:leading-[54px] xl:text-[64px] xl:leading-[70px]">
            {"Fail fast. Fix faster.\nShip fastest. Secure."}
          </h1>
          <p className="mt-6 max-w-[500px] text-base leading-6 text-muted-foreground md:text-[19px] md:leading-[29px]">
            An open-source group building the tools we use ourselves to work with AI agents, without trading security
            for productivity.
          </p>
          <div className="mt-8 flex gap-3">
            <Link
              href="#projects"
              className="inline-flex h-12 items-center rounded-[10px] bg-primary px-5 font-semibold text-primary-foreground"
            >
              Explore projects
            </Link>
            <Link
              href={site.links.github}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center rounded-[10px] border px-5 font-semibold"
            >
              GitHub
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
