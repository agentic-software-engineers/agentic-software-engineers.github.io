"use client"

import { useEffect } from "react"

// the landing page stays dark, also when the docs were switched to light before it
export function ForceDark() {
  useEffect(() => {
    const root = document.documentElement
    root.classList.remove("light")
    root.classList.add("dark")
    root.style.colorScheme = "dark"
  }, [])
  return null
}
