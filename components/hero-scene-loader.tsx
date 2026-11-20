"use client"

import dynamic from "next/dynamic"

// three.js loads in its own chunk, after the page and its text are on screen
export const HeroSceneLoader = dynamic(() => import("./hero-scene").then((m) => m.HeroScene), { ssr: false })
