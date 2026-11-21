"use client"

import { useEffect, useRef, useState, useSyncExternalStore } from "react"

import { Highlighter } from "@/components/ui/highlighter"
import { RetroGrid } from "@/components/ui/retro-grid"

type Box = { x0: number; y0: number; x1: number; y1: number }
export type Logo = { defs: string; paths: string[]; boxes: Box[] }

const WORDS = ["Fail fast.", "Fix faster.", "Ship fastest.", "Secure."]
const LOGO_SIZE = 384.054

// the opened ship: each piece with the logo paths it draws and where it moves
type Piece = { idx: number[]; dx: number; dy: number; role: "bridge" | "cargo" | "hull" | "named" | "sea" }
function pieces(boxes: Box[]): Piece[] {
  const cargo = [0, 1, 2, 3, 4, 5, 6].map((i): Piece => {
    const b = boxes[i]
    return { idx: [i], dx: ((b.x0 + b.x1) / 2 - 190) * 0.55, dy: b.y0 < 80 ? -90 : -66, role: "cargo" }
  })
  return [
    { idx: [7], dx: -135, dy: 15, role: "bridge" },
    { idx: [11], dx: 0, dy: 0, role: "hull" },
    { idx: [8, 9], dx: 0, dy: 0, role: "named" },
    { idx: [10], dx: 0, dy: 58, role: "sea" },
    ...cargo,
  ]
}

const LABELS = [
  { at: 7, place: "left", title: "Bridge", line: "People set the course." },
  { at: 1, place: "above", title: "Cargo", line: "Deliver anything." },
  { at: 11, place: "right", y: 0.3, title: "Hull", line: "Strong enough for every voyage." },
  { at: 10, place: "left", title: "Sea", line: "A reliable experience in any environment." },
] as const

const clamp = (x: number) => Math.min(1, Math.max(0, x))
const smooth = (x: number) => {
  const c = clamp(x)
  return c * c * (3 - 2 * c)
}

// ids inside one inline svg are made unique, so several copies of the logo's gradients can share the page
function scoped(svg: string, prefix: string) {
  return svg.replace(/id="([^"]+)"/g, `id="${prefix}-$1"`).replace(/url\(#([^)]+)\)/g, `url(#${prefix}-$1)`)
}

function useReducedMotion() {
  return useSyncExternalStore(
    (on) => {
      const m = window.matchMedia("(prefers-reduced-motion: reduce)")
      m.addEventListener("change", on)
      return () => m.removeEventListener("change", on)
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  )
}

export function HeroStage({ logo }: { logo: Logo }) {
  const track = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const [size, setSize] = useState({ w: 1440, h: 844 })
  const [progress, setProgress] = useState(0)

  // the stage's size sets every distance; scrolling through the track sets the progress
  useEffect(() => {
    const el = stage.current
    const section = track.current
    if (!el || !section) return
    let frame = 0
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight })
    const read = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const r = section.getBoundingClientRect()
        setProgress(clamp(-r.top / Math.max(1, r.height - el.clientHeight)))
      })
    }
    measure()
    read()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    window.addEventListener("scroll", read, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      ro.disconnect()
      window.removeEventListener("scroll", read)
    }
  }, [])

  const s = reduced ? 1 : progress
  const { w: W, h: H } = size
  const narrow = W < 768
  // the retro grid's horizon: where its tilted plane meets the line of sight (perspective 200, angle 65)
  const horizon = H / 2 - 200 / Math.tan((65 * Math.PI) / 180)
  const span = (a: number, b: number) => clamp((s - a) / (b - a))

  const full = Math.min(W * (narrow ? 0.86 : 0.62), H * 0.78)
  const arrive = span(0.4, 0.52)
  const settle = span(0.5, 0.58)
  const open = smooth(span(0.76, 0.94))
  const sloganIn = smooth(span(0.58, 0.64))
  const sloganOut = smooth(span(0.72, 0.78))
  const az = Math.pow(arrive, 1.8)
  const scale = (0.04 + az * 0.96) * (1 - 0.42 * sloganIn) * (1 - 0.15 * open)
  const logoSize = full * scale
  const cx = W / 2
  const cy = H / 2 + (horizon - H / 2) * (1 - az) - H * 0.14 * sloganIn
  const left = cx - logoSize / 2
  const top = cy - logoSize / 2
  const k = logoSize / LOGO_SIZE
  const glow = Math.sin(settle * Math.PI) * 40 + 8 * az
  const parts = pieces(logo.boxes)

  // a piece's box on screen, where it has moved to
  const rect = (i: number) => {
    const p = parts.find((q) => q.idx.includes(i)) ?? parts[0]
    const bs = p.idx.map((j) => logo.boxes[j])
    const b = { x0: Math.min(...bs.map((v) => v.x0)), y0: Math.min(...bs.map((v) => v.y0)), x1: Math.max(...bs.map((v) => v.x1)), y1: Math.max(...bs.map((v) => v.y1)) }
    const ox = left + p.dx * open * k
    const oy = top + p.dy * open * k
    return { l: ox + b.x0 * k, t: oy + b.y0 * k, r: ox + b.x1 * k, b: oy + b.y1 * k }
  }
  const opacity = (p: Piece) => {
    if (p.role === "named") return 1 - smooth(open / 0.35)
    if (p.role === "hull") return open > 0 ? 1 : 0
    if (p.idx[0] === 4) return 1 - open
    return 1
  }
  const labelsIn = smooth((open - 0.6) / 0.4)
  const thumb = (idx: number[], n: number) => {
    const bs = idx.map((j) => logo.boxes[j])
    const x0 = Math.min(...bs.map((v) => v.x0)) - 2
    const y0 = Math.min(...bs.map((v) => v.y0)) - 2
    const x1 = Math.max(...bs.map((v) => v.x1)) + 2
    const y1 = Math.max(...bs.map((v) => v.y1)) + 2
    return (
      <svg viewBox={`${x0} ${y0} ${x1 - x0} ${y1 - y0}`} className="size-10 flex-none" aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: scoped(logo.defs + idx.map((j) => logo.paths[j]).join(""), `t${n}`) }} />
    )
  }

  return (
    <section ref={track} className={reduced ? "relative" : "relative h-[600svh]"}>
      <div ref={stage} className="sticky top-14 h-[calc(100svh-3.5rem)] overflow-hidden bg-background">
        <div className="absolute inset-0" style={{ opacity: narrow ? 1 - open : 1 }}>
          <RetroGrid darkLineColor="#27bbe5" lightLineColor="#27bbe5" opacity={0.6} />
        </div>

        {/* the four words come in from the horizon, one after another */}
        <div aria-hidden="true">
          {WORDS.map((word, i) => {
            const p = i === 0 ? 0.08 + 0.92 * span(0, 0.14) : span(i * 0.1, i * 0.1 + 0.14)
            const z = Math.pow(p, 2.2)
            const fade = p < 0.15 ? p / 0.15 : p > 0.75 ? (1 - p) / 0.25 : 1
            return (
              <div key={word}
                className={`absolute left-1/2 text-[44px] font-extrabold tracking-[-0.03em] whitespace-nowrap md:text-8xl ${i === 3 ? "text-primary" : ""}`}
                style={{ top: horizon, opacity: p <= 0 || p >= 1 ? 0 : fade, transform: `translate(-50%, calc(-50% + ${z * H * 0.55}px)) scale(${0.04 + z * 2.6})` }}>
                {word}
              </div>
            )
          })}
        </div>

        {/* the logo, whole until it opens into its parts */}
        <svg viewBox={`0 0 ${LOGO_SIZE} ${LOGO_SIZE}`} aria-hidden="true" className="absolute overflow-visible"
          style={{ left, top, width: logoSize, height: logoSize, opacity: arrive <= 0 ? 0 : Math.min(1, arrive * 4), filter: `drop-shadow(0 0 ${glow}px rgba(75,223,203,.7))` }}>
          <g dangerouslySetInnerHTML={{ __html: scoped(logo.defs, "hero") }} />
          {parts.map((p) => (
            <g key={p.idx.join("-")} transform={`translate(${p.dx * open} ${p.dy * open})`} opacity={opacity(p)}
              dangerouslySetInnerHTML={{ __html: scoped(p.idx.map((j) => logo.paths[j]).join(""), "hero").replace(/id="hero-[^"]+"/g, "") }} />
          ))}
        </svg>

        {/* the full slogan, with Secure. marked */}
        <h1 className="absolute inset-x-0 text-center text-3xl leading-tight font-extrabold tracking-[-0.03em] md:text-[56px]"
          style={{ top: H / 2 + full * 0.168 + 10, opacity: sloganIn * (1 - sloganOut), transform: `translateY(${(1 - sloganIn) * 30}px)` }}>
          Fail fast. Fix faster.
          <br />
          Ship fastest.{" "}
          <Highlighter action="highlight" color="#4bdfcb" padding={4}>
            <span className="text-background">Secure.</span>
          </Highlighter>
        </h1>

        {/* the parts, named beside them on wide screens and listed below on phones */}
        <dl className="pointer-events-none absolute inset-0" style={{ opacity: open > 0.6 ? labelsIn : 0 }}>
          {narrow
            ? LABELS.map((l, n) => (
                <div key={l.title} className="absolute inset-x-6 flex items-center gap-3.5" style={{ top: rect(10).b + 40 + n * 52 }}>
                  {thumb(parts.find((p) => p.idx.includes(l.at))?.idx ?? [l.at], n)}
                  <div>
                    <dt className="text-sm font-semibold">{l.title}</dt>
                    <dd className="text-xs text-muted-foreground">{l.line}</dd>
                  </div>
                </div>
              ))
            : LABELS.map((l) => {
                const r = rect(l.at)
                const y = r.t + (r.b - r.t) * ("y" in l ? l.y : 0.5)
                const style =
                  l.place === "left" ? { right: W - r.l + 22, top: y, transform: "translateY(-50%)" }
                  : l.place === "right" ? { left: r.r + 22, top: y, transform: "translateY(-50%)" }
                  : { left: (r.l + r.r) / 2, top: r.t - 22, transform: "translate(-50%, -100%)" }
                return (
                  <div key={l.title} className="absolute w-max" style={style}>
                    <dt className="text-[17px] font-semibold">{l.title}</dt>
                    <dd className="mt-0.5 text-[13px] text-muted-foreground">{l.line}</dd>
                  </div>
                )
              })}
        </dl>

        <div className="absolute bottom-7 left-1/2 -translate-x-1/2 text-[13px] tracking-[0.16em] text-muted-foreground uppercase"
          style={{ opacity: 1 - smooth(span(0, 0.05)) }} aria-hidden="true">
          Scroll
        </div>
      </div>
    </section>
  )
}
