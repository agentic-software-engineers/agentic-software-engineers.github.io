"use client"

import { useEffect, useRef, useSyncExternalStore } from "react"
import * as THREE from "three"
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js"

// the logo's gradients, in the coordinates of artwork's logo/parts/hull/color.svg
const GRADIENTS: Record<string, { a: [number, number]; b: [number, number]; stops: [number, string][] }> = {
  tide: { a: [375, 80], b: [40, 300], stops: [[0, "#4bdfcb"], [0.45, "#27bbe5"], [1, "#3b6fe0"]] },
  cargo: { a: [260, 40], b: [30, 160], stops: [[0, "#4bdfcb"], [1, "#3798dc"]] },
}

// the sea: Gerstner waves, one definition for the shader and for the physics
const SEA_Y = -290
const WAVES = (
  [
    [1, 0.35, 520, 48, 1.0],
    [0.6, -0.8, 320, 22, 1.25],
    [-0.3, 1, 200, 9, 1.6],
  ] as const
).map(([dx, dz, length, amplitude, speed]) => {
  const n = Math.hypot(dx, dz)
  const k = (2 * Math.PI) / length
  return { dx: dx / n, dz: dz / n, k, a: amplitude, w: Math.sqrt(9.81 * k * 60) * speed * 0.18 }
})
const STEEPNESS = 0.5

function gerstner(x: number, z: number, t: number): [number, number, number] {
  let px = x
  let py = 0
  let pz = z
  for (const w of WAVES) {
    const f = w.k * (w.dx * x + w.dz * z) - w.w * t
    px += STEEPNESS * w.a * w.dx * Math.cos(f)
    pz += STEEPNESS * w.a * w.dz * Math.cos(f)
    py += w.a * Math.sin(f)
  }
  return [px, py, pz]
}

// the water's height above a world point: the horizontal shift is inverted with a few fixed-point steps
function waterY(x: number, z: number, t: number) {
  let ux = x
  let uz = z
  for (let i = 0; i < 4; i++) {
    const [px, , pz] = gerstner(ux, uz, t)
    ux -= px - x
    uz -= pz - z
  }
  return SEA_Y + gerstner(ux, uz, t)[1]
}

const GLSL_WAVES = WAVES.map((w) => `vec4(${w.dx.toFixed(5)}, ${w.dz.toFixed(5)}, ${w.k.toFixed(6)}, ${w.a.toFixed(3)})`).join(", ")
const GLSL_OMEGA = WAVES.map((w) => w.w.toFixed(6)).join(", ")

// framing: wide screens see the sea beside and below the text, narrow ones see it above the text
const WIDE = { distance: 1500, fov: 30, lookY: -80 }
const NARROW = { distance: 900, fov: 46, lookY: -150 }

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

function buildShip(svg: string, scale: number) {
  const art = new THREE.Group()
  // every path of the hull becomes a solid, painted with the logo's gradient at its place
  for (const path of new SVGLoader().parse(svg).paths) {
    const style = path.userData?.style as { fill?: string } | undefined
    const name = /#(\w+)/.exec(String(style?.fill))?.[1] ?? "tide"
    const depth = name === "cargo" ? 30 : 40
    for (const shape of SVGLoader.createShapes(path)) {
      const geometry = new THREE.ExtrudeGeometry(shape, {
        depth,
        bevelEnabled: true,
        bevelThickness: 1.6,
        bevelSize: 1.2,
        bevelSegments: 3,
        curveSegments: 24,
      })
      geometry.translate(0, 0, -depth / 2)
      const position = geometry.attributes.position
      const colours = new Float32Array(position.count * 3)
      for (let i = 0; i < position.count; i++) colourAt(name in GRADIENTS ? name : "tide", position.getX(i), position.getY(i)).toArray(colours, i * 3)
      geometry.setAttribute("color", new THREE.BufferAttribute(colours, 3))
      art.add(new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.35, metalness: 0.15 })))
      // the letters are holes through the hull; a dark plate inside them reads as an engraving
      if (name === "tide" && shape.holes.length) {
        for (const hole of shape.holes) {
          const plate = new THREE.ExtrudeGeometry(new THREE.Shape(hole.getPoints(48)), { depth: 4, bevelEnabled: false })
          plate.translate(0, 0, -2)
          art.add(new THREE.Mesh(plate, new THREE.MeshStandardMaterial({ color: "#0b1214", roughness: 0.8 })))
        }
      }
    }
  }
  // SVG y points down; the ship is centred on its own origin
  art.scale.set(scale, -scale, scale)
  art.position.sub(new THREE.Box3().setFromObject(art).getCenter(new THREE.Vector3()))
  const ship = new THREE.Group()
  ship.add(art)
  return ship
}

function buildSea(time: { value: number }) {
  const geometry = new THREE.PlaneGeometry(4000, 1600, 400, 160)
  geometry.rotateX(-Math.PI / 2)
  const material = new THREE.ShaderMaterial({
    uniforms: { t: time },
    vertexShader: /* glsl */ `
      uniform float t; varying float vH; varying float vD; varying float vZ;
      const vec4 W[3] = vec4[3](${GLSL_WAVES}); const float OM[3] = float[3](${GLSL_OMEGA});
      void main(){
        vec3 p = position; vec3 o = p;
        for (int i = 0; i < 3; i++) {
          float f = W[i].z * dot(W[i].xy, o.xz) - OM[i] * t;
          p.x += ${STEEPNESS.toFixed(2)} * W[i].w * W[i].x * cos(f);
          p.z += ${STEEPNESS.toFixed(2)} * W[i].w * W[i].y * cos(f);
          p.y += W[i].w * sin(f);
        }
        vH = p.y; vD = length(p.xz) / 1800.0; vZ = p.z + p.y * 0.7;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }`,
    // the sea is solid, so it hides the hull below its surface; in the distance it fades into the page
    fragmentShader: /* glsl */ `
      varying float vH; varying float vD; varying float vZ;
      void main(){
        vec3 deep = vec3(0.051,0.059,0.059), body = vec3(0.04,0.11,0.14), line = vec3(0.153,0.733,0.898), crest = vec3(0.294,0.874,0.796);
        float k = smoothstep(-60.0, 60.0, vH);
        vec3 c = mix(deep, body, k);
        float q = vZ / 38.0;
        float l = 1.0 - smoothstep(0.0, fwidth(q) * 1.2, abs(fract(q) - 0.5));
        c = mix(c, mix(line, crest, k), l * (0.25 + 0.75 * k));
        gl_FragColor = vec4(mix(c, deep, smoothstep(0.30, 0.95, vD)), 1.0);
      }`,
  })
  const sea = new THREE.Mesh(geometry, material)
  sea.position.y = SEA_Y
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

  // the hero's text follows the scroll on its own, so it fades even while the scene pauses or is absent
  useEffect(() => {
    const hero = host.current?.closest("section")
    if (!hero) return
    const update = () => {
      const r = hero.getBoundingClientRect()
      hero.style.setProperty("--hero-scroll", String(Math.min(1, Math.max(0, -r.top / Math.max(1, r.height)))))
    }
    update()
    window.addEventListener("scroll", update, { passive: true })
    return () => window.removeEventListener("scroll", update)
  }, [])

  useEffect(() => {
    const el = host.current
    // without WebGL the logo itself stands in for the scene
    if (!el || !supported) return
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let disposed = false
    let frame = 0
    let visible = true

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.domElement.setAttribute("aria-hidden", "true")
    el.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.background = new THREE.Color("#0d0f0f")
    const time = { value: 0 }
    scene.add(buildSea(time))
    scene.add(new THREE.HemisphereLight("#e8fdff", "#0d0f0f", 2.0))
    for (const [colour, intensity, x, y, z] of [
      ["#ffffff", 1.8, 0, 120, 900],
      ["#ffffff", 2.2, -200, 300, 400],
      ["#4bdfcb", 1.6, 300, 100, -300],
    ] as const) {
      const light = new THREE.DirectionalLight(colour, intensity)
      light.position.set(x, y, z)
      scene.add(light)
    }
    const camera = new THREE.PerspectiveCamera(30, 1, 1, 6000)
    let wrap = 800
    let narrow = false

    // the camera frames the sea for the current width, and the course comes round just past the visible edge
    const resize = () => {
      const w = el.clientWidth
      const h = el.clientHeight
      narrow = w < 1280
      const layout = narrow ? NARROW : WIDE
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.fov = layout.fov
      const yaw = THREE.MathUtils.degToRad(-18)
      const pitch = THREE.MathUtils.degToRad(10)
      const r = layout.distance
      camera.position.set(r * Math.sin(yaw) * Math.cos(pitch), r * Math.sin(pitch), r * Math.cos(yaw) * Math.cos(pitch))
      camera.lookAt(0, layout.lookY, 0)
      camera.updateProjectionMatrix()
      wrap = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect * r + 160
    }

    const start = async () => {
      const [svg, { default: RAPIER }] = await Promise.all([
        fetch("/hull.svg").then((r) => r.text()),
        import("@dimforge/rapier3d-compat"),
      ])
      await RAPIER.init()
      if (disposed) return
      resize()

      const ship = buildShip(svg, 0.62)
      scene.add(ship)
      const hull = new THREE.Box3().setFromObject(ship)
      const size = hull.getSize(new THREE.Vector3())
      // where the logo's wave meets the hull: y 275 between the hull's top (47) and its keel (335) on the 384 canvas
      const waterline = hull.max.y - ((275 - 47) / (335 - 47)) * size.y

      // physics: one rigid body, with its mass low in the keel so it rights itself like a ship
      const MASS = 1000
      const GRAVITY = 600
      const world = new RAPIER.World({ x: 0, y: -GRAVITY, z: 0 })
      const body = world.createRigidBody(
        RAPIER.RigidBodyDesc.dynamic()
          .setTranslation(narrow ? -wrap * 0.2 : wrap * 0.05, SEA_Y + 40, -40)
          .setLinearDamping(0.6)
          .setAngularDamping(0.5),
      )
      const half = { x: size.x * 0.42, y: size.y * 0.3, z: 60 }
      world.createCollider(
        RAPIER.ColliderDesc.cuboid(half.x, half.y, half.z).setMassProperties(
          MASS,
          { x: 0, y: hull.min.y * 0.8, z: 0 },
          { x: MASS * 1600, y: MASS * 9000, z: MASS * 3600 },
          { x: 0, y: 0, z: 0, w: 1 },
        ),
        body,
      )
      // floats along the keel, across the beam; at rest the logo's waterline meets the water
      const floatY = hull.min.y + 6
      const restDepth = waterline - floatY
      const floats: THREE.Vector3[] = []
      for (const fx of [-0.8, -0.27, 0.27, 0.8]) for (const fz of [-1, 1]) floats.push(new THREE.Vector3(fx * half.x, floatY, fz * half.z))
      const K = (MASS * GRAVITY) / (floats.length * restDepth)
      const C = 650

      // a random course ahead: the ship always sails toward +x, so it shows the side the logo draws
      const nextTarget = (fromX: number) =>
        new THREE.Vector3(fromX + 260 + Math.random() * 260, 0, narrow ? -120 + Math.random() * 160 : -180 + Math.random() * 260)
      let target = nextTarget(narrow ? -wrap * 0.2 : wrap * 0.05)

      // the wake: the water the ship has just crossed, fading behind it
      const WAKE = 180
      const wakePoints: [number, number][] = []
      const wakeGeometry = new THREE.BufferGeometry()
      wakeGeometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(WAKE * 3), 3))
      const wakeColours = new Float32Array(WAKE * 3)
      for (let k = 0; k < WAKE; k++) {
        const f = 1 - k / WAKE
        wakeColours.set([0.29 * f, 0.87 * f, 0.8 * f], k * 3)
      }
      wakeGeometry.setAttribute("color", new THREE.BufferAttribute(wakeColours, 3))
      scene.add(new THREE.Line(wakeGeometry, new THREE.LineBasicMaterial({ vertexColors: true })))

      const DT = 1 / 60
      const q = new THREE.Quaternion()
      const v = new THREE.Vector3()
      const forward = new THREE.Vector3()
      let t = 0
      const step = () => {
        const p = body.translation()
        const r = body.rotation()
        q.set(r.x, r.y, r.z, r.w)
        body.resetForces(true)
        body.resetTorques(true)
        // buoyancy and water drag at every float under the surface
        for (const f of floats) {
          v.copy(f).applyQuaternion(q).add(p)
          const depth = waterY(v.x, v.z, t) - v.y
          if (depth > 0) {
            const vel = body.velocityAtPoint({ x: v.x, y: v.y, z: v.z })
            body.addForceAtPoint(
              { x: -vel.x * C * 0.25, y: K * Math.min(depth, restDepth * 2.5) - vel.y * C, z: -vel.z * C * 0.25 },
              { x: v.x, y: v.y, z: v.z },
              true,
            )
          }
        }
        // thrust along the bow; the rudder turns the bow toward the next waypoint
        forward.set(1, 0, 0).applyQuaternion(q)
        forward.y = 0
        forward.normalize()
        if (target.x - p.x < 60) target = nextTarget(target.x)
        const heading = Math.atan2(-forward.z, forward.x)
        const want = THREE.MathUtils.clamp(Math.atan2(-(target.z - p.z), target.x - p.x), -0.6, 0.6)
        const error = Math.atan2(Math.sin(want - heading), Math.cos(want - heading))
        body.addTorque({ x: 0, y: MASS * 9000 * error - MASS * 3000 * body.angvel().y, z: 0 }, true)
        body.addForce({ x: forward.x * MASS * 260, y: 0, z: forward.z * MASS * 260 }, true)
        world.timestep = DT
        world.step()
        t += DT
        // past the right edge the course comes round to the left again
        const np = body.translation()
        if (np.x > wrap) {
          body.setTranslation({ x: -wrap, y: np.y, z: np.z }, true)
          target = nextTarget(-wrap)
          wakePoints.length = 0
        }
        wakePoints.unshift([np.x, np.z])
        if (wakePoints.length > WAKE) wakePoints.pop()
      }

      const draw = () => {
        const p = body.translation()
        const r = body.rotation()
        ship.position.set(p.x, p.y, p.z)
        ship.quaternion.set(r.x, r.y, r.z, r.w)
        time.value = t
        const positions = wakeGeometry.attributes.position as THREE.BufferAttribute
        wakePoints.forEach(([x, z], k) => positions.setXYZ(k, x, waterY(x, z, t) + 3, z))
        positions.needsUpdate = true
        wakeGeometry.setDrawRange(0, wakePoints.length)
        renderer.render(scene, camera)
      }

      // reduced motion shows one still moment of the voyage
      if (still) {
        while (t < 3) step()
        draw()
        return
      }

      let last = performance.now()
      let pending = 0
      const loop = () => {
        frame = requestAnimationFrame(loop)
        const now = performance.now()
        // a fixed physics step keeps the ship's motion the same at every frame rate
        pending = Math.min(pending + (now - last) / 1000, 0.25)
        last = now
        if (!visible) return
        while (pending >= DT) {
          step()
          pending -= DT
        }
        draw()
      }
      loop()
    }

    // the scene pauses while the hero is off screen
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
    })
    observer.observe(el)
    window.addEventListener("resize", resize)
    start()

    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener("resize", resize)
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
