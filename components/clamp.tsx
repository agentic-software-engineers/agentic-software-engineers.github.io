"use client"

import { useLayoutEffect, useRef, useState } from "react"

// shows as many words as fit in the given number of lines, and ends with [...] when the text goes further
export function Clamp({ text, lines = 3 }: { text: string; lines?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [shown, setShown] = useState(text)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const words = text.split(" ")
    const fit = () => {
      const max = parseFloat(getComputedStyle(el).lineHeight) * lines + 1
      el.textContent = text
      if (el.getBoundingClientRect().height <= max) return setShown(text)
      let lo = 0
      let hi = words.length - 1
      while (lo < hi) {
        const mid = Math.ceil((lo + hi) / 2)
        el.textContent = `${words.slice(0, mid).join(" ")} [...]`
        if (el.getBoundingClientRect().height <= max) lo = mid
        else hi = mid - 1
      }
      setShown(`${words.slice(0, lo).join(" ")} [...]`)
    }
    fit()
    // measure again once the web font is in, its glyphs set the line breaks
    let live = true
    document.fonts.ready.then(() => live && fit())
    const ro = new ResizeObserver(fit)
    ro.observe(el.parentElement ?? el)
    return () => {
      live = false
      ro.disconnect()
    }
  }, [text, lines])

  return (
    <span ref={ref} className="block" title={shown === text ? undefined : text}>
      {shown}
    </span>
  )
}
