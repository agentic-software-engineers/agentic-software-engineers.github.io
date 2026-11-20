"use client"

import { useEffect, useRef, useSyncExternalStore } from "react"
import * as THREE from "three"
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js"

// the logo's gradients, in the coordinates of artwork's logo/full/color.svg
const GRADIENTS: Record<string, { a: [number, number]; b: [number, number]; stops: [number, string][] }> = {
  tide: { a: [375, 80], b: [40, 300], stops: [[0, "#4bdfcb"], [0.45, "#27bbe5"], [1, "#3b6fe0"]] },
  cargo: { a: [260, 40], b: [30, 160], stops: [[0, "#4bdfcb"], [1, "#3798dc"]] },
  wave: { a: [8, 0], b: [340, 0], stops: [[0, "#4bdfcb"], [0.6, "#27bbe5"], [1, "#3b6fe0"]] },
}
const DEPTH: Record<string, number> = { tide: 40, cargo: 30, wave: 16 }

// framing per layout: the ship sits right of the text from 1280 px and centred above it below that
const WIDE = { ox: 660, dist: 1.55, fov: 30 }
const NARROW = { ox: 0, dist: 1.08, fov: 44 }

function colourAt(name: string, x: number, y: number) {
  const g = GRADIENTS[name]
  const [ax, ay] = g.a
  const [bx, by] = g.b
  const dx = bx - ax
  const dy = by - ay
  const t = Math.min(1, Math.max(0, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)))
  // find the two stops the position falls between
  for (let i = 1; i < g.stops.length; i++) {
    if (t <= g.stops[i][0]) {
      const [t0, c0] = g.stops[i - 1]
      const [t1, c1] = g.stops[i]
      return new THREE.Color(c0).lerp(new THREE.Color(c1), (t - t0) / (t1 - t0))
    }
  }
  return new THREE.Color(g.stops[g.stops.length - 1][1])
}

function paint(geometry: THREE.BufferGeometry, name: string) {
  const position = geometry.attributes.position
  const colours = new Float32Array(position.count * 3)
  // each vertex takes the gradient at its place in the logo
  for (let i = 0; i < position.count; i++) {
    colourAt(name, position.getX(i), position.getY(i)).toArray(colours, i * 3)
  }
  geometry.setAttribute("color", new THREE.BufferAttribute(colours, 3))
}

function buildShip(svg: string) {
  const ship = new THREE.Group()
  const surface = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.35, metalness: 0.15 })
  const engraving = new THREE.MeshStandardMaterial({ color: "#0b1214", roughness: 0.8 })
  let engraved = false
  // every path of the logo becomes a solid of its own depth
  for (const path of new SVGLoader().parse(svg).paths) {
    const style = path.userData?.style as { fill?: string } | undefined
    const name = /#(\w+)/.exec(String(style?.fill))?.[1] ?? "tide"
    for (const shape of SVGLoader.createShapes(path)) {
      const depth = DEPTH[name] ?? 30
      const geometry = new THREE.ExtrudeGeometry(shape, {
        depth,
        bevelEnabled: true,
        bevelThickness: 1.6,
        bevelSize: 1.2,
        bevelSegments: 3,
        curveSegments: 24,
      })
      geometry.translate(0, 0, -depth / 2)
      paint(geometry, name)
      const mesh = new THREE.Mesh(geometry, surface)
      if (name === "wave") mesh.position.z = 26
      ship.add(mesh)
      // the letters are holes through the hull; a dark plate inside them reads as an engraving
      if (name === "tide" && !engraved && shape.holes.length) {
        for (const hole of shape.holes) {
          const plate = new THREE.ExtrudeGeometry(new THREE.Shape(hole.getPoints(48)), { depth: 4, bevelEnabled: false })
          plate.translate(0, 0, -2)
          ship.add(new THREE.Mesh(plate, engraving))
        }
        engraved = true
      }
    }
  }
  // SVG y points down; the ship is centred on its own origin
  ship.scale.y = -1
  const centre = new THREE.Box3().setFromObject(ship).getCenter(new THREE.Vector3())
  ship.position.sub(centre)
  return ship
}

function buildSea(time: { value: number }) {
  const geometry = new THREE.PlaneGeometry(4000, 1600, 320, 128)
  geometry.rotateX(-Math.PI / 2)
  const material = new THREE.ShaderMaterial({
    uniforms: { t: time },
    transparent: true,
    vertexShader: /* glsl */ `
      uniform float t; varying float vH; varying float vD; varying float vZ;
      float h(vec2 p){ return sin(p.x*0.008 + t*0.9)*10.0 + sin(p.y*0.012 - t*1.1)*6.0 + sin((p.x+p.y)*0.02 + t*1.7)*2.5; }
      void main(){
        vec3 p = position; p.y += h(p.xz);
        vH = p.y; vD = length(p.xz)/1800.0; vZ = p.z + p.y * 2.2;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      varying float vH; varying float vD; varying float vZ;
      void main(){
        vec3 deep = vec3(0.051,0.059,0.059), body = vec3(0.04,0.11,0.14), line = vec3(0.153,0.733,0.898), crest = vec3(0.294,0.874,0.796);
        float k = smoothstep(-16.0, 16.0, vH);
        vec3 c = mix(deep, body, k);
        float q = vZ / 38.0;
        float l = 1.0 - smoothstep(0.0, fwidth(q) * 1.2, abs(fract(q) - 0.5));
        c = mix(c, mix(line, crest, k), l * (0.25 + 0.75 * k));
        gl_FragColor = vec4(c, 1.0 - smoothstep(0.30, 0.95, vD));
      }`,
  })
  const sea = new THREE.Mesh(geometry, material)
  sea.position.y = -150
  return sea
}

let webgl: boolean | undefined
// WebGL support never changes during a visit, so it is read once and kept
function hasWebGL() {
  if (webgl === undefined) {
    try {
      const canvas = document.createElement("canvas")
      webgl = Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"))
    } catch {
      webgl = false
    }
  }
  return webgl
}
const subscribe = () => () => {}

export function HeroScene() {
  const host = useRef<HTMLDivElement>(null)
  // the server renders the scene's place; the browser decides whether WebGL can fill it
  const supported = useSyncExternalStore(subscribe, hasWebGL, () => true)

  useEffect(() => {
    const el = host.current
    // without WebGL the logo itself stands in for the scene
    if (!el || !supported) return
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const hero = el.closest("section")
    let disposed = false
    let frame = 0
    let visible = true

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.domElement.setAttribute("aria-hidden", "true")
    el.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.background = new THREE.Color("#0d0f0f")
    const time = { value: 0.7 }
    scene.add(buildSea(time))
    scene.add(new THREE.HemisphereLight("#e8fdff", "#0d0f0f", 2.0))
    const front = new THREE.DirectionalLight("#ffffff", 1.8)
    front.position.set(0, 120, 900)
    scene.add(front)
    const key = new THREE.DirectionalLight("#ffffff", 2.2)
    key.position.set(-200, 300, 400)
    scene.add(key)
    const rim = new THREE.DirectionalLight("#4bdfcb", 1.6)
    rim.position.set(300, 100, -300)
    scene.add(rim)

    const wrap = new THREE.Group()
    scene.add(wrap)
    const camera = new THREE.PerspectiveCamera(30, 1, 1, 5000)
    let shipX = 0

    // the camera frames the scene for the current width, and the ship takes its place beside the text
    const resize = () => {
      const w = el.clientWidth
      const h = el.clientHeight
      // ship and text sit side by side from 1280 px, the width where the headline leaves room for the ship
      const layout = w < 1280 ? NARROW : WIDE
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.fov = layout.fov
      const r = 760 * layout.dist
      const yaw = THREE.MathUtils.degToRad(-18)
      const pitch = THREE.MathUtils.degToRad(8)
      camera.position.set(r * Math.sin(yaw) * Math.cos(pitch), r * Math.sin(pitch), r * Math.cos(yaw) * Math.cos(pitch))
      camera.lookAt(layout.ox * 0.55, -30, 0)
      camera.updateProjectionMatrix()
      // the projection below reads the camera's world matrix, which otherwise updates only when rendering
      camera.updateMatrixWorld()
      shipX = layout.ox
      // on wide screens the ship's centre sits at 72 % of the 1200 px content column, wherever that column is
      if (layout === WIDE) {
        const column = Math.min(w, 1200) - 48
        const left = Math.max(24, (w - 1200) / 2 + 24)
        const ray = new THREE.Vector3(((left + column * 0.72) / w) * 2 - 1, 0, 0.5).unproject(camera).sub(camera.position)
        shipX = camera.position.x + ray.x * (-camera.position.z / ray.z)
      }
    }

    // the pointer turns the ship, eased toward its target
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 }
    const onPointer = (e: PointerEvent) => {
      pointer.tx = (e.clientX / window.innerWidth) * 2 - 1
      pointer.ty = (e.clientY / window.innerHeight) * 2 - 1
    }

    // scrolling through the hero sails the ship out and fades the text
    const scrolled = () => {
      if (!hero) return 0
      const r = hero.getBoundingClientRect()
      return Math.min(1, Math.max(0, -r.top / Math.max(1, r.height)))
    }

    const draw = (seconds: number) => {
      const s = scrolled()
      const ease = s * s * (3 - 2 * s)
      hero?.style.setProperty("--hero-scroll", String(s))
      pointer.x += (pointer.tx - pointer.x) * 0.06
      pointer.y += (pointer.ty - pointer.y) * 0.06
      time.value = 0.7 + seconds
      wrap.position.set(shipX + ease * 1650, Math.sin(time.value * 0.9) * 6, -ease * 380)
      wrap.rotation.set(Math.sin(time.value * 1.1) * 0.018 + pointer.y * 0.1, -ease * 0.35 + pointer.x * 0.2, Math.sin(time.value * 0.9 + 0.6) * 0.025)
      renderer.render(scene, camera)
    }

    const start = performance.now()
    const loop = () => {
      frame = requestAnimationFrame(loop)
      if (visible) draw((performance.now() - start) / 1000)
    }

    // the scene pauses while the hero is off screen
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
    })

    fetch("/ship.svg")
      .then((r) => r.text())
      .then((svg) => {
        if (disposed) return
        wrap.add(buildShip(svg))
        resize()
        // reduced motion shows one still frame
        if (still) {
          draw(0)
          return
        }
        observer.observe(el)
        window.addEventListener("pointermove", onPointer, { passive: true })
        loop()
      })
    window.addEventListener("resize", resize)

    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener("resize", resize)
      window.removeEventListener("pointermove", onPointer)
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [supported])

  return (
    <div ref={host} className="absolute inset-0">
      {!supported && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/ship.svg" alt="" className="absolute right-[12%] top-1/2 w-[28rem] max-w-[60%] -translate-y-1/2" />
      )}
    </div>
  )
}
