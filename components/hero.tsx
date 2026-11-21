import { readFileSync } from "node:fs"
import { join } from "node:path"

import { HeroStage, type Logo } from "@/components/hero-stage"

// the logo is read once at build time and cut into its parts: 0-6 cargo, 7 bridge, 8-9 the hull with its name, 10 the sea
function loadLogo(): Logo {
  const svg = readFileSync(join(process.cwd(), "public/logo-full.svg"), "utf8")
  const defs = svg.match(/<defs>[\s\S]*?<\/defs>/)?.[0] ?? ""
  const paths: string[] = [...(svg.match(/<path [^>]*\/>/g) ?? [])]
  const numbers = (p: string) => (p.match(/ d="([^"]+)"/)?.[1].match(/-?\d+\.?\d*/g) ?? []).map(Number)
  const box = (p: string) => {
    const n = numbers(p)
    const xs = n.filter((_, k) => k % 2 === 0)
    const ys = n.filter((_, k) => k % 2 === 1)
    return { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) }
  }
  // the plain hull: the outline of the hull alone, without the letters cut into it
  const hull = paths[8].match(/ d="([^"]+)"/)?.[1] ?? ""
  const area = (d: string) => {
    const b = box(` d="${d}"`)
    return (b.x1 - b.x0) * (b.y1 - b.y0)
  }
  const outline = hull.split(/(?=M)/).filter((s) => s.trim()).reduce((a, b) => (area(a) > area(b) ? a : b))
  paths.push(paths[8].replace(/ d="[^"]+"/, ` d="${outline}"`))
  return { defs, paths, boxes: paths.map(box) }
}

export function Hero() {
  return <HeroStage logo={loadLogo()} />
}
