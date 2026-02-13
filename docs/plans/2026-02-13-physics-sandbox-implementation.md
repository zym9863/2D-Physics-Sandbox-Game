# 2D Physics Sandbox Game Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a 2D physics destruction sandbox where players construct buildings from various materials then destroy them with weapons, observing realistic physics and particle effects.

**Architecture:** Vite + TypeScript modular project using matter.js for physics. Custom Canvas 2D renderer with camera system. Two game modes (Build / Destroy) controlled by a central Engine class. UI is pure DOM elements overlaid on the canvas.

**Tech Stack:** Vite 8, TypeScript 5.9, matter.js, HTML5 Canvas 2D, pnpm

**Important TS notes:** `erasableSyntaxOnly: true` means NO enums — use `as const` objects. `verbatimModuleSyntax: true` means use `import type` for type-only imports.

---

### Task 1: Project Setup — Install matter.js, Clean Template, Create Canvas

**Files:**
- Modify: `package.json`
- Modify: `index.html`
- Modify: `src/main.ts`
- Modify: `src/style.css`
- Delete: `src/counter.ts`
- Delete: `src/typescript.svg`
- Delete: `public/vite.svg`

**Step 1: Install matter.js**

Run: `pnpm add matter-js && pnpm add -D @types/matter-js`

**Step 2: Delete template files**

```bash
rm src/counter.ts src/typescript.svg public/vite.svg
```

**Step 3: Write `index.html`**

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>2D Physics Sandbox</title>
  </head>
  <body>
    <div id="app">
      <canvas id="game-canvas"></canvas>
    </div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

**Step 4: Write `src/style.css`**

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: system-ui, -apple-system, sans-serif;
  background: #1a1a2e;
  color: #e0e0e0;
}

#app {
  width: 100%;
  height: 100%;
  position: relative;
}

#game-canvas {
  display: block;
  width: 100%;
  height: 100%;
}
```

**Step 5: Write minimal `src/main.ts`**

```typescript
import './style.css'

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement
const ctx = canvas.getContext('2d')!

function resize() {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}

resize()
window.addEventListener('resize', resize)

// Temp: draw something to verify canvas works
ctx.fillStyle = '#16213e'
ctx.fillRect(0, 0, canvas.width, canvas.height)
ctx.fillStyle = '#e94560'
ctx.font = '48px system-ui'
ctx.textAlign = 'center'
ctx.fillText('2D Physics Sandbox', canvas.width / 2, canvas.height / 2)
```

**Step 6: Verify**

Run: `pnpm dev` — should see dark canvas with red title text centered.

**Step 7: Commit**

```bash
git add -A && git commit -m "feat: project setup with canvas and matter.js dependency"
```

---

### Task 2: Core Engine — matter.js World + Game Loop + Custom Renderer

**Files:**
- Create: `src/core/Engine.ts`
- Create: `src/core/Renderer.ts`
- Modify: `src/main.ts`

**Step 1: Write `src/core/Engine.ts`**

```typescript
import Matter from 'matter-js'

export class Engine {
  matterEngine: Matter.Engine
  world: Matter.World
  private running = true

  constructor() {
    this.matterEngine = Matter.Engine.create({
      gravity: { x: 0, y: 1, scale: 0.001 },
    })
    this.world = this.matterEngine.world

    // Ground
    const ground = Matter.Bodies.rectangle(600, 580, 1200, 40, {
      isStatic: true,
      render: { fillStyle: '#2d3436' },
    })
    Matter.Composite.add(this.world, ground)
  }

  update(delta: number) {
    if (!this.running) return
    Matter.Engine.update(this.matterEngine, delta)
  }

  addBody(body: Matter.Body) {
    Matter.Composite.add(this.world, body)
  }

  removeBody(body: Matter.Body) {
    Matter.Composite.remove(this.world, body)
  }

  getAllBodies(): Matter.Body[] {
    return Matter.Composite.allBodies(this.world)
  }

  togglePause() {
    this.running = !this.running
    return this.running
  }

  get isPaused() {
    return !this.running
  }

  clear() {
    Matter.Composite.clear(this.world, false)
    // Re-add ground
    const ground = Matter.Bodies.rectangle(600, 580, 1200, 40, {
      isStatic: true,
      render: { fillStyle: '#2d3436' },
    })
    Matter.Composite.add(this.world, ground)
  }
}
```

**Step 2: Write `src/core/Renderer.ts`**

```typescript
import type Matter from 'matter-js'

export class Renderer {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
  }

  resize() {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
  }

  clear() {
    this.ctx.fillStyle = '#16213e'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }

  drawBodies(bodies: Matter.Body[]) {
    const ctx = this.ctx
    for (const body of bodies) {
      const vertices = body.vertices
      ctx.beginPath()
      ctx.moveTo(vertices[0].x, vertices[0].y)
      for (let i = 1; i < vertices.length; i++) {
        ctx.lineTo(vertices[i].x, vertices[i].y)
      }
      ctx.closePath()

      const fillStyle = (body.render as { fillStyle?: string }).fillStyle
      ctx.fillStyle = fillStyle ?? '#e94560'
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.15)'
      ctx.lineWidth = 1
      ctx.stroke()
    }
  }

  drawCircleBody(body: Matter.Body) {
    const ctx = this.ctx
    const pos = body.position
    const radius = (body.circleRadius ?? 10)
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2)
    const fillStyle = (body.render as { fillStyle?: string }).fillStyle
    ctx.fillStyle = fillStyle ?? '#e94560'
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'
    ctx.lineWidth = 1
    ctx.stroke()
  }

  drawBodiesSmart(bodies: Matter.Body[]) {
    for (const body of bodies) {
      if (body.circleRadius) {
        this.drawCircleBody(body)
      } else {
        this.drawBodies([body])
      }
    }
  }
}
```

**Step 3: Update `src/main.ts`**

```typescript
import './style.css'
import { Engine } from './core/Engine.ts'
import { Renderer } from './core/Renderer.ts'
import Matter from 'matter-js'

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement
const engine = new Engine()
const renderer = new Renderer(canvas)

renderer.resize()
window.addEventListener('resize', () => renderer.resize())

// Demo: add some falling boxes
for (let i = 0; i < 10; i++) {
  const box = Matter.Bodies.rectangle(
    300 + Math.random() * 400,
    50 + Math.random() * 200,
    40 + Math.random() * 30,
    40 + Math.random() * 30,
    { render: { fillStyle: '#e94560' } }
  )
  engine.addBody(box)
}

let lastTime = 0
function gameLoop(time: number) {
  const delta = lastTime ? time - lastTime : 16.67
  lastTime = time

  engine.update(delta)
  renderer.clear()
  renderer.drawBodiesSmart(engine.getAllBodies())

  requestAnimationFrame(gameLoop)
}

requestAnimationFrame(gameLoop)
```

**Step 4: Verify**

Run: `pnpm dev` — should see red boxes falling and landing on a dark ground bar.

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: core engine with matter.js world and custom canvas renderer"
```

---

### Task 3: Camera System — Pan and Zoom

**Files:**
- Create: `src/core/Camera.ts`
- Modify: `src/core/Renderer.ts`
- Modify: `src/main.ts`

**Step 1: Write `src/core/Camera.ts`**

```typescript
export class Camera {
  x = 0
  y = 0
  zoom = 1

  private minZoom = 0.2
  private maxZoom = 5

  pan(dx: number, dy: number) {
    this.x -= dx / this.zoom
    this.y -= dy / this.zoom
  }

  zoomAt(delta: number, screenX: number, screenY: number, canvasW: number, canvasH: number) {
    const oldZoom = this.zoom
    const factor = delta > 0 ? 0.9 : 1.1
    this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoom * factor))

    // Zoom toward cursor
    const worldX = (screenX - canvasW / 2) / oldZoom + this.x
    const worldY = (screenY - canvasH / 2) / oldZoom + this.y
    this.x = worldX - (screenX - canvasW / 2) / this.zoom
    this.y = worldY - (screenY - canvasH / 2) / this.zoom
  }

  screenToWorld(screenX: number, screenY: number, canvasW: number, canvasH: number) {
    return {
      x: (screenX - canvasW / 2) / this.zoom + this.x,
      y: (screenY - canvasH / 2) / this.zoom + this.y,
    }
  }

  applyTransform(ctx: CanvasRenderingContext2D, canvasW: number, canvasH: number) {
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.translate(canvasW / 2, canvasH / 2)
    ctx.scale(this.zoom, this.zoom)
    ctx.translate(-this.x, -this.y)
  }

  resetTransform(ctx: CanvasRenderingContext2D) {
    ctx.setTransform(1, 0, 0, 1, 0, 0)
  }
}
```

**Step 2: Update `src/core/Renderer.ts`** — add camera-aware rendering

Add `camera` parameter to `clear()` and drawing methods. The `clear()` method should reset transform before filling. `drawBodiesSmart` should be wrapped with camera transform:

```typescript
import type Matter from 'matter-js'
import type { Camera } from './Camera.ts'

export class Renderer {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
  }

  resize() {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
  }

  clear() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0)
    this.ctx.fillStyle = '#16213e'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }

  render(bodies: Matter.Body[], camera: Camera) {
    this.clear()
    camera.applyTransform(this.ctx, this.canvas.width, this.canvas.height)

    for (const body of bodies) {
      if (body.circleRadius) {
        this.drawCircle(body)
      } else {
        this.drawPolygon(body)
      }
    }

    camera.resetTransform(this.ctx)
  }

  private drawPolygon(body: Matter.Body) {
    const ctx = this.ctx
    const vertices = body.vertices
    ctx.beginPath()
    ctx.moveTo(vertices[0].x, vertices[0].y)
    for (let i = 1; i < vertices.length; i++) {
      ctx.lineTo(vertices[i].x, vertices[i].y)
    }
    ctx.closePath()
    ctx.fillStyle = (body.render as { fillStyle?: string }).fillStyle ?? '#e94560'
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'
    ctx.lineWidth = 1 / 1 // Will be updated later with camera zoom
    ctx.stroke()
  }

  private drawCircle(body: Matter.Body) {
    const ctx = this.ctx
    const pos = body.position
    const radius = body.circleRadius ?? 10
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2)
    ctx.fillStyle = (body.render as { fillStyle?: string }).fillStyle ?? '#e94560'
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'
    ctx.lineWidth = 1
    ctx.stroke()
  }
}
```

**Step 3: Update `src/main.ts`** — add camera + right-click pan + scroll zoom

```typescript
import './style.css'
import { Engine } from './core/Engine.ts'
import { Renderer } from './core/Renderer.ts'
import { Camera } from './core/Camera.ts'
import Matter from 'matter-js'

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement
const engine = new Engine()
const renderer = new Renderer(canvas)
const camera = new Camera()

// Center camera on the scene
camera.x = 600
camera.y = 400

renderer.resize()
window.addEventListener('resize', () => renderer.resize())

// Demo bodies
for (let i = 0; i < 15; i++) {
  const box = Matter.Bodies.rectangle(
    300 + Math.random() * 600,
    50 + Math.random() * 300,
    30 + Math.random() * 40,
    30 + Math.random() * 40,
    { render: { fillStyle: `hsl(${Math.random() * 360}, 70%, 55%)` } }
  )
  engine.addBody(box)
}

// Camera controls
let isPanning = false
let lastMouse = { x: 0, y: 0 }

canvas.addEventListener('mousedown', (e) => {
  if (e.button === 2) {
    isPanning = true
    lastMouse = { x: e.clientX, y: e.clientY }
  }
})

canvas.addEventListener('mousemove', (e) => {
  if (isPanning) {
    camera.pan(e.clientX - lastMouse.x, e.clientY - lastMouse.y)
    lastMouse = { x: e.clientX, y: e.clientY }
  }
})

canvas.addEventListener('mouseup', (e) => {
  if (e.button === 2) isPanning = false
})

canvas.addEventListener('wheel', (e) => {
  e.preventDefault()
  camera.zoomAt(e.deltaY, e.clientX, e.clientY, canvas.width, canvas.height)
}, { passive: false })

canvas.addEventListener('contextmenu', (e) => e.preventDefault())

// Game loop
let lastTime = 0
function gameLoop(time: number) {
  const delta = lastTime ? Math.min(time - lastTime, 32) : 16.67
  lastTime = time

  engine.update(delta)
  renderer.render(engine.getAllBodies(), camera)

  requestAnimationFrame(gameLoop)
}

requestAnimationFrame(gameLoop)
```

**Step 4: Verify**

Run: `pnpm dev` — right-click drag to pan, scroll wheel to zoom. Colorful boxes falling.

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: camera system with pan and zoom controls"
```

---

### Task 4: Material System

**Files:**
- Create: `src/physics/Materials.ts`

**Step 1: Write `src/physics/Materials.ts`**

```typescript
export const MaterialType = {
  WOOD: 'wood',
  BRICK: 'brick',
  STONE: 'stone',
  STEEL: 'steel',
  GLASS: 'glass',
} as const

export type MaterialType = (typeof MaterialType)[keyof typeof MaterialType]

export interface MaterialDef {
  type: MaterialType
  label: string
  density: number
  friction: number
  restitution: number
  fractureThreshold: number // impulse needed to break
  color: string
  strokeColor: string
  debrisColor: string
}

export const MATERIALS: Record<MaterialType, MaterialDef> = {
  wood: {
    type: MaterialType.WOOD,
    label: '木材',
    density: 0.004,
    friction: 0.6,
    restitution: 0.2,
    fractureThreshold: 5,
    color: '#8B6914',
    strokeColor: '#6B4F12',
    debrisColor: '#A0782C',
  },
  brick: {
    type: MaterialType.BRICK,
    label: '砖块',
    density: 0.008,
    friction: 0.7,
    restitution: 0.1,
    fractureThreshold: 10,
    color: '#C0392B',
    strokeColor: '#962D22',
    debrisColor: '#D4574A',
  },
  stone: {
    type: MaterialType.STONE,
    label: '石材',
    density: 0.012,
    friction: 0.8,
    restitution: 0.05,
    fractureThreshold: 20,
    color: '#7F8C8D',
    strokeColor: '#616A6B',
    debrisColor: '#95A5A6',
  },
  steel: {
    type: MaterialType.STEEL,
    label: '钢铁',
    density: 0.02,
    friction: 0.4,
    restitution: 0.3,
    fractureThreshold: 50,
    color: '#BDC3C7',
    strokeColor: '#95A5A6',
    debrisColor: '#D5DBDB',
  },
  glass: {
    type: MaterialType.GLASS,
    label: '玻璃',
    density: 0.006,
    friction: 0.2,
    restitution: 0.4,
    fractureThreshold: 2,
    color: 'rgba(174, 214, 241, 0.6)',
    strokeColor: 'rgba(133, 193, 233, 0.8)',
    debrisColor: 'rgba(174, 214, 241, 0.8)',
  },
}

export function getMaterialOptions(type: MaterialType) {
  const mat = MATERIALS[type]
  return {
    density: mat.density,
    friction: mat.friction,
    restitution: mat.restitution,
    render: { fillStyle: mat.color },
    label: mat.type,
  }
}
```

**Step 2: Commit**

```bash
git add -A && git commit -m "feat: material system with 5 material types"
```

---

### Task 5: Input Manager

**Files:**
- Create: `src/core/InputManager.ts`

**Step 1: Write `src/core/InputManager.ts`**

```typescript
import type { Camera } from './Camera.ts'

export type ToolHandler = {
  onMouseDown?: (worldX: number, worldY: number, e: MouseEvent) => void
  onMouseMove?: (worldX: number, worldY: number, e: MouseEvent) => void
  onMouseUp?: (worldX: number, worldY: number, e: MouseEvent) => void
}

export class InputManager {
  private canvas: HTMLCanvasElement
  private camera: Camera
  private isPanning = false
  private lastMouse = { x: 0, y: 0 }
  private toolHandler: ToolHandler | null = null
  private keyHandlers = new Map<string, () => void>()

  constructor(canvas: HTMLCanvasElement, camera: Camera) {
    this.canvas = canvas
    this.camera = camera
    this.setup()
  }

  setToolHandler(handler: ToolHandler | null) {
    this.toolHandler = handler
  }

  onKey(key: string, handler: () => void) {
    this.keyHandlers.set(key, handler)
  }

  private toWorld(e: MouseEvent) {
    return this.camera.screenToWorld(
      e.clientX, e.clientY,
      this.canvas.width, this.canvas.height,
    )
  }

  private setup() {
    const canvas = this.canvas

    canvas.addEventListener('mousedown', (e) => {
      if (e.button === 2) {
        this.isPanning = true
        this.lastMouse = { x: e.clientX, y: e.clientY }
        return
      }
      if (e.button === 0 && this.toolHandler?.onMouseDown) {
        const w = this.toWorld(e)
        this.toolHandler.onMouseDown(w.x, w.y, e)
      }
    })

    canvas.addEventListener('mousemove', (e) => {
      if (this.isPanning) {
        this.camera.pan(e.clientX - this.lastMouse.x, e.clientY - this.lastMouse.y)
        this.lastMouse = { x: e.clientX, y: e.clientY }
        return
      }
      if (this.toolHandler?.onMouseMove) {
        const w = this.toWorld(e)
        this.toolHandler.onMouseMove(w.x, w.y, e)
      }
    })

    canvas.addEventListener('mouseup', (e) => {
      if (e.button === 2) {
        this.isPanning = false
        return
      }
      if (e.button === 0 && this.toolHandler?.onMouseUp) {
        const w = this.toWorld(e)
        this.toolHandler.onMouseUp(w.x, w.y, e)
      }
    })

    canvas.addEventListener('wheel', (e) => {
      e.preventDefault()
      this.camera.zoomAt(e.deltaY, e.clientX, e.clientY, canvas.width, canvas.height)
    }, { passive: false })

    canvas.addEventListener('contextmenu', (e) => e.preventDefault())

    window.addEventListener('keydown', (e) => {
      const handler = this.keyHandlers.get(e.code)
      if (handler) {
        e.preventDefault()
        handler()
      }
    })
  }
}
```

**Step 2: Commit**

```bash
git add -A && git commit -m "feat: input manager with tool handler and camera controls"
```

---

### Task 6: Build System — Place Blocks

**Files:**
- Create: `src/building/BuildSystem.ts`
- Modify: `src/main.ts`

**Step 1: Write `src/building/BuildSystem.ts`**

```typescript
import Matter from 'matter-js'
import type { Engine } from '../core/Engine.ts'
import type { ToolHandler } from '../core/InputManager.ts'
import { type MaterialType, getMaterialOptions } from '../physics/Materials.ts'

export const ShapeType = {
  RECT: 'rect',
  CIRCLE: 'circle',
  TRIANGLE: 'triangle',
} as const

export type ShapeType = (typeof ShapeType)[keyof typeof ShapeType]

export class BuildSystem {
  private engine: Engine
  currentMaterial: MaterialType = 'wood'
  currentShape: ShapeType = 'rect'
  blockWidth = 80
  blockHeight = 30

  // Ghost preview
  ghostX = 0
  ghostY = 0
  showGhost = false

  constructor(engine: Engine) {
    this.engine = engine
  }

  getToolHandler(): ToolHandler {
    return {
      onMouseDown: (wx, wy) => {
        this.placeBlock(wx, wy)
      },
      onMouseMove: (wx, wy) => {
        this.ghostX = wx
        this.ghostY = wy
        this.showGhost = true
      },
    }
  }

  placeBlock(x: number, y: number) {
    const opts = getMaterialOptions(this.currentMaterial)
    let body: Matter.Body

    switch (this.currentShape) {
      case ShapeType.RECT:
        body = Matter.Bodies.rectangle(x, y, this.blockWidth, this.blockHeight, opts)
        break
      case ShapeType.CIRCLE:
        body = Matter.Bodies.circle(x, y, this.blockHeight / 2, opts)
        break
      case ShapeType.TRIANGLE:
        body = Matter.Bodies.polygon(x, y, 3, this.blockHeight, opts)
        break
      default:
        body = Matter.Bodies.rectangle(x, y, this.blockWidth, this.blockHeight, opts)
    }

    this.engine.addBody(body)
    return body
  }

  drawGhost(ctx: CanvasRenderingContext2D) {
    if (!this.showGhost) return

    ctx.save()
    ctx.globalAlpha = 0.4

    const x = this.ghostX
    const y = this.ghostY

    ctx.fillStyle = '#ffffff'
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2

    switch (this.currentShape) {
      case ShapeType.RECT:
        ctx.fillRect(x - this.blockWidth / 2, y - this.blockHeight / 2, this.blockWidth, this.blockHeight)
        break
      case ShapeType.CIRCLE:
        ctx.beginPath()
        ctx.arc(x, y, this.blockHeight / 2, 0, Math.PI * 2)
        ctx.fill()
        break
      case ShapeType.TRIANGLE: {
        const r = this.blockHeight
        ctx.beginPath()
        for (let i = 0; i < 3; i++) {
          const angle = (i * 2 * Math.PI) / 3 - Math.PI / 2
          const px = x + r * Math.cos(angle)
          const py = y + r * Math.sin(angle)
          if (i === 0) ctx.moveTo(px, py)
          else ctx.lineTo(px, py)
        }
        ctx.closePath()
        ctx.fill()
        break
      }
    }

    ctx.restore()
  }
}
```

**Step 2: Update `src/main.ts`** — integrate InputManager + BuildSystem, remove demo code

```typescript
import './style.css'
import { Engine } from './core/Engine.ts'
import { Renderer } from './core/Renderer.ts'
import { Camera } from './core/Camera.ts'
import { InputManager } from './core/InputManager.ts'
import { BuildSystem } from './building/BuildSystem.ts'

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement
const engine = new Engine()
const renderer = new Renderer(canvas)
const camera = new Camera()
const input = new InputManager(canvas, camera)
const buildSystem = new BuildSystem(engine)

camera.x = 600
camera.y = 400

renderer.resize()
window.addEventListener('resize', () => renderer.resize())

// Set build tool as default
input.setToolHandler(buildSystem.getToolHandler())

// Keyboard shortcuts
input.onKey('Space', () => engine.togglePause())

// Game loop
let lastTime = 0
function gameLoop(time: number) {
  const delta = lastTime ? Math.min(time - lastTime, 32) : 16.67
  lastTime = time

  engine.update(delta)

  renderer.clear()
  camera.applyTransform(renderer.ctx, canvas.width, canvas.height)

  // Draw bodies
  const bodies = engine.getAllBodies()
  for (const body of bodies) {
    if (body.circleRadius) {
      renderer.drawCircle(body)
    } else {
      renderer.drawPolygon(body)
    }
  }

  // Draw ghost preview
  buildSystem.drawGhost(renderer.ctx)

  camera.resetTransform(renderer.ctx)

  requestAnimationFrame(gameLoop)
}

requestAnimationFrame(gameLoop)
```

**Step 3: Make `drawCircle` and `drawPolygon` public in Renderer.ts**

Change `private drawPolygon` to `drawPolygon` and `private drawCircle` to `drawCircle`.

**Step 4: Verify**

Run: `pnpm dev` — left-click to place blocks that fall with gravity. Right-click to pan, scroll to zoom.

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: build system with block placement and ghost preview"
```

---

### Task 7: UI — Toolbar, TopBar, BottomBar

**Files:**
- Create: `src/ui/Toolbar.ts`
- Create: `src/ui/TopBar.ts`
- Create: `src/ui/BottomBar.ts`
- Modify: `src/style.css`
- Modify: `src/main.ts`

**Step 1: Write `src/ui/TopBar.ts`**

```typescript
export const GameMode = {
  BUILD: 'build',
  DESTROY: 'destroy',
} as const

export type GameMode = (typeof GameMode)[keyof typeof GameMode]

export class TopBar {
  element: HTMLDivElement
  private mode: GameMode = GameMode.BUILD
  private onModeChange: (mode: GameMode) => void
  private onReset: () => void
  private onPause: () => void
  private pauseBtn: HTMLButtonElement

  constructor(opts: {
    onModeChange: (mode: GameMode) => void
    onReset: () => void
    onPause: () => void
  }) {
    this.onModeChange = opts.onModeChange
    this.onReset = opts.onReset
    this.onPause = opts.onPause

    this.element = document.createElement('div')
    this.element.className = 'top-bar'

    const buildBtn = this.createBtn('build-btn active', '搭建', () => this.setMode(GameMode.BUILD))
    const destroyBtn = this.createBtn('destroy-btn', '破坏', () => this.setMode(GameMode.DESTROY))
    const resetBtn = this.createBtn('reset-btn', '重置', () => this.onReset())
    this.pauseBtn = this.createBtn('pause-btn', '暂停', () => this.onPause())

    const modeGroup = document.createElement('div')
    modeGroup.className = 'btn-group'
    modeGroup.append(buildBtn, destroyBtn)

    const actionGroup = document.createElement('div')
    actionGroup.className = 'btn-group'
    actionGroup.append(resetBtn, this.pauseBtn)

    this.element.append(modeGroup, actionGroup)
  }

  setMode(mode: GameMode) {
    this.mode = mode
    this.element.querySelectorAll('.mode-btn').forEach((btn) => btn.classList.remove('active'))
    this.element.querySelector(`.${mode}-btn`)?.classList.add('active')
    this.onModeChange(mode)
  }

  setPauseLabel(paused: boolean) {
    this.pauseBtn.textContent = paused ? '继续' : '暂停'
  }

  getMode() {
    return this.mode
  }

  private createBtn(cls: string, text: string, onClick: () => void): HTMLButtonElement {
    const btn = document.createElement('button')
    btn.className = `ui-btn mode-btn ${cls}`
    btn.textContent = text
    btn.addEventListener('click', onClick)
    return btn
  }
}
```

**Step 2: Write `src/ui/Toolbar.ts`**

```typescript
import { MATERIALS, type MaterialType } from '../physics/Materials.ts'
import { ShapeType } from '../building/BuildSystem.ts'

interface ToolItem {
  id: string
  label: string
  icon: string
  group: 'material' | 'shape' | 'weapon'
}

const MATERIAL_TOOLS: ToolItem[] = Object.values(MATERIALS).map((m) => ({
  id: m.type,
  label: m.label,
  icon: m.color,
  group: 'material' as const,
}))

const SHAPE_TOOLS: ToolItem[] = [
  { id: ShapeType.RECT, label: '矩形', icon: '▬', group: 'shape' },
  { id: ShapeType.CIRCLE, label: '圆形', icon: '●', group: 'shape' },
  { id: ShapeType.TRIANGLE, label: '三角', icon: '▲', group: 'shape' },
]

const WEAPON_TOOLS: ToolItem[] = [
  { id: 'bomb', label: '炸弹', icon: '💣', group: 'weapon' },
  { id: 'cannon', label: '大炮', icon: '🔫', group: 'weapon' },
  { id: 'ball', label: '铁球', icon: '⚫', group: 'weapon' },
  { id: 'laser', label: '激光', icon: '⚡', group: 'weapon' },
]

export class Toolbar {
  element: HTMLDivElement
  private onSelectMaterial: (type: MaterialType) => void
  private onSelectShape: (type: ShapeType) => void
  private onSelectWeapon: (type: string) => void
  private currentSection: 'build' | 'destroy' = 'build'

  constructor(opts: {
    onSelectMaterial: (type: MaterialType) => void
    onSelectShape: (type: ShapeType) => void
    onSelectWeapon: (type: string) => void
  }) {
    this.onSelectMaterial = opts.onSelectMaterial
    this.onSelectShape = opts.onSelectShape
    this.onSelectWeapon = opts.onSelectWeapon

    this.element = document.createElement('div')
    this.element.className = 'toolbar'
    this.renderBuildTools()
  }

  showBuildTools() {
    this.currentSection = 'build'
    this.renderBuildTools()
  }

  showDestroyTools() {
    this.currentSection = 'destroy'
    this.renderDestroyTools()
  }

  private renderBuildTools() {
    this.element.innerHTML = ''

    this.addSection('材质')
    for (const tool of MATERIAL_TOOLS) {
      this.addTool(tool, () => {
        this.setActive(tool.id)
        this.onSelectMaterial(tool.id as MaterialType)
      })
    }

    this.addSection('形状')
    for (const tool of SHAPE_TOOLS) {
      this.addTool(tool, () => {
        this.setActive(tool.id)
        this.onSelectShape(tool.id as ShapeType)
      })
    }

    // Default selection
    this.setActive('wood')
  }

  private renderDestroyTools() {
    this.element.innerHTML = ''

    this.addSection('武器')
    for (const tool of WEAPON_TOOLS) {
      this.addTool(tool, () => {
        this.setActive(tool.id)
        this.onSelectWeapon(tool.id)
      })
    }

    this.setActive('bomb')
  }

  private addSection(title: string) {
    const h = document.createElement('div')
    h.className = 'toolbar-section'
    h.textContent = title
    this.element.appendChild(h)
  }

  private addTool(tool: ToolItem, onClick: () => void) {
    const btn = document.createElement('button')
    btn.className = 'toolbar-item'
    btn.dataset.toolId = tool.id

    if (tool.group === 'material') {
      const swatch = document.createElement('span')
      swatch.className = 'color-swatch'
      swatch.style.backgroundColor = tool.icon
      btn.appendChild(swatch)
    } else {
      const icon = document.createElement('span')
      icon.className = 'tool-icon'
      icon.textContent = tool.icon
      btn.appendChild(icon)
    }

    const label = document.createElement('span')
    label.className = 'tool-label'
    label.textContent = tool.label
    btn.appendChild(label)

    btn.addEventListener('click', onClick)
    this.element.appendChild(btn)
  }

  private setActive(id: string) {
    this.element.querySelectorAll('.toolbar-item').forEach((el) => el.classList.remove('active'))
    this.element.querySelector(`[data-tool-id="${id}"]`)?.classList.add('active')
  }
}
```

**Step 3: Write `src/ui/BottomBar.ts`**

```typescript
export class BottomBar {
  element: HTMLDivElement
  private onGravityChange: (value: number) => void
  private onSpeedChange: (value: number) => void

  constructor(opts: {
    onGravityChange: (value: number) => void
    onSpeedChange: (value: number) => void
  }) {
    this.onGravityChange = opts.onGravityChange
    this.onSpeedChange = opts.onSpeedChange

    this.element = document.createElement('div')
    this.element.className = 'bottom-bar'

    this.element.innerHTML = `
      <div class="control-group">
        <label>重力</label>
        <input type="range" id="gravity-slider" min="0" max="3" step="0.1" value="1" />
        <span id="gravity-value">1.0</span>
      </div>
      <div class="control-group">
        <label>速度</label>
        <input type="range" id="speed-slider" min="0.1" max="3" step="0.1" value="1" />
        <span id="speed-value">1.0</span>
      </div>
    `

    const gravSlider = this.element.querySelector('#gravity-slider') as HTMLInputElement
    const gravLabel = this.element.querySelector('#gravity-value') as HTMLSpanElement
    gravSlider.addEventListener('input', () => {
      const v = parseFloat(gravSlider.value)
      gravLabel.textContent = v.toFixed(1)
      this.onGravityChange(v)
    })

    const speedSlider = this.element.querySelector('#speed-slider') as HTMLInputElement
    const speedLabel = this.element.querySelector('#speed-value') as HTMLSpanElement
    speedSlider.addEventListener('input', () => {
      const v = parseFloat(speedSlider.value)
      speedLabel.textContent = v.toFixed(1)
      this.onSpeedChange(v)
    })
  }
}
```

**Step 4: Update `src/style.css`** — add all UI styles

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: system-ui, -apple-system, sans-serif;
  background: #1a1a2e;
  color: #e0e0e0;
  user-select: none;
}

#app {
  width: 100%;
  height: 100%;
  position: relative;
}

#game-canvas {
  display: block;
  width: 100%;
  height: 100%;
}

/* Top Bar */
.top-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 48px;
  background: rgba(15, 15, 30, 0.9);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  z-index: 10;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.btn-group {
  display: flex;
  gap: 4px;
}

.ui-btn {
  padding: 8px 16px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.06);
  color: #ccc;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
}

.ui-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}

.ui-btn.active {
  background: #e94560;
  color: #fff;
  border-color: #e94560;
}

/* Toolbar */
.toolbar {
  position: absolute;
  top: 56px;
  left: 8px;
  width: 140px;
  background: rgba(15, 15, 30, 0.9);
  backdrop-filter: blur(8px);
  border-radius: 8px;
  padding: 8px;
  z-index: 10;
  border: 1px solid rgba(255, 255, 255, 0.08);
  max-height: calc(100vh - 120px);
  overflow-y: auto;
}

.toolbar-section {
  font-size: 11px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 8px 8px 4px;
  margin-top: 4px;
}

.toolbar-section:first-child {
  margin-top: 0;
}

.toolbar-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 6px 8px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  color: #ccc;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
}

.toolbar-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.toolbar-item.active {
  background: rgba(233, 69, 96, 0.2);
  border-color: rgba(233, 69, 96, 0.4);
  color: #fff;
}

.color-swatch {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
}

.tool-icon {
  font-size: 16px;
  width: 16px;
  text-align: center;
  flex-shrink: 0;
}

.tool-label {
  flex: 1;
}

/* Bottom Bar */
.bottom-bar {
  position: absolute;
  bottom: 8px;
  left: 160px;
  right: 8px;
  height: 44px;
  background: rgba(15, 15, 30, 0.9);
  backdrop-filter: blur(8px);
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 0 20px;
  z-index: 10;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.control-group {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #aaa;
}

.control-group label {
  min-width: 30px;
}

.control-group input[type="range"] {
  width: 120px;
  accent-color: #e94560;
}

.control-group span {
  min-width: 28px;
  color: #fff;
  font-size: 12px;
}
```

**Step 5: Update `src/main.ts`** — integrate all UI components

```typescript
import './style.css'
import { Engine } from './core/Engine.ts'
import { Renderer } from './core/Renderer.ts'
import { Camera } from './core/Camera.ts'
import { InputManager } from './core/InputManager.ts'
import { BuildSystem } from './building/BuildSystem.ts'
import { TopBar, GameMode } from './ui/TopBar.ts'
import { Toolbar } from './ui/Toolbar.ts'
import { BottomBar } from './ui/BottomBar.ts'
import type { MaterialType } from './physics/Materials.ts'
import type { ShapeType } from './building/BuildSystem.ts'

const app = document.getElementById('app')!
const canvas = document.getElementById('game-canvas') as HTMLCanvasElement
const engine = new Engine()
const renderer = new Renderer(canvas)
const camera = new Camera()
const input = new InputManager(canvas, camera)
const buildSystem = new BuildSystem(engine)

camera.x = 600
camera.y = 400

renderer.resize()
window.addEventListener('resize', () => renderer.resize())

// Current weapon (for destroy mode)
let currentWeapon = 'bomb'

// UI
const topBar = new TopBar({
  onModeChange: (mode) => {
    if (mode === GameMode.BUILD) {
      toolbar.showBuildTools()
      input.setToolHandler(buildSystem.getToolHandler())
    } else {
      toolbar.showDestroyTools()
      input.setToolHandler(null) // Will be set by weapon selection
    }
  },
  onReset: () => engine.clear(),
  onPause: () => {
    const running = engine.togglePause()
    topBar.setPauseLabel(!running)
  },
})

const toolbar = new Toolbar({
  onSelectMaterial: (type: MaterialType) => {
    buildSystem.currentMaterial = type
  },
  onSelectShape: (type: ShapeType) => {
    buildSystem.currentShape = type
  },
  onSelectWeapon: (type: string) => {
    currentWeapon = type
    // Weapon tool handlers will be added in later tasks
    input.setToolHandler(null)
  },
})

const bottomBar = new BottomBar({
  onGravityChange: (v) => {
    engine.matterEngine.gravity.y = v
  },
  onSpeedChange: (v) => {
    engine.matterEngine.timing.timeScale = v
  },
})

app.appendChild(topBar.element)
app.appendChild(toolbar.element)
app.appendChild(bottomBar.element)

// Default to build mode
input.setToolHandler(buildSystem.getToolHandler())

// Keyboard shortcuts
input.onKey('Space', () => {
  const running = engine.togglePause()
  topBar.setPauseLabel(!running)
})

// Game loop
let lastTime = 0
function gameLoop(time: number) {
  const delta = lastTime ? Math.min(time - lastTime, 32) : 16.67
  lastTime = time

  engine.update(delta)

  renderer.clear()
  camera.applyTransform(renderer.ctx, canvas.width, canvas.height)

  const bodies = engine.getAllBodies()
  for (const body of bodies) {
    if (body.circleRadius) {
      renderer.drawCircle(body)
    } else {
      renderer.drawPolygon(body)
    }
  }

  buildSystem.drawGhost(renderer.ctx)

  camera.resetTransform(renderer.ctx)

  requestAnimationFrame(gameLoop)
}

requestAnimationFrame(gameLoop)
```

**Step 6: Verify**

Run: `pnpm dev` — full UI with top bar (mode switch), left toolbar (materials/shapes), bottom bar (gravity/speed sliders). Click to place colored blocks.

**Step 7: Commit**

```bash
git add -A && git commit -m "feat: complete UI with toolbar, top bar, and bottom bar controls"
```

---

### Task 8: Grid Snap System

**Files:**
- Create: `src/building/Grid.ts`
- Modify: `src/building/BuildSystem.ts`
- Modify: `src/core/Renderer.ts`

**Step 1: Write `src/building/Grid.ts`**

```typescript
export class Grid {
  enabled = false
  size = 20

  snap(x: number, y: number): { x: number; y: number } {
    if (!this.enabled) return { x, y }
    return {
      x: Math.round(x / this.size) * this.size,
      y: Math.round(y / this.size) * this.size,
    }
  }

  draw(ctx: CanvasRenderingContext2D, camera: { x: number; y: number; zoom: number }, canvasW: number, canvasH: number) {
    if (!this.enabled) return

    ctx.save()
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
    ctx.lineWidth = 1

    const left = camera.x - canvasW / 2 / camera.zoom
    const top = camera.y - canvasH / 2 / camera.zoom
    const right = camera.x + canvasW / 2 / camera.zoom
    const bottom = camera.y + canvasH / 2 / camera.zoom

    const startX = Math.floor(left / this.size) * this.size
    const startY = Math.floor(top / this.size) * this.size

    for (let x = startX; x <= right; x += this.size) {
      ctx.beginPath()
      ctx.moveTo(x, top)
      ctx.lineTo(x, bottom)
      ctx.stroke()
    }

    for (let y = startY; y <= bottom; y += this.size) {
      ctx.beginPath()
      ctx.moveTo(left, y)
      ctx.lineTo(right, y)
      ctx.stroke()
    }

    ctx.restore()
  }
}
```

**Step 2: Integrate grid into BuildSystem** — snap ghost position and placement

In `BuildSystem`, add a `grid: Grid` property, snap coordinates in `getToolHandler` mouse events and `placeBlock`.

**Step 3: Add grid toggle button to TopBar or key binding** (`KeyG` to toggle grid)

**Step 4: Verify**

Press G to toggle grid. Blocks snap to grid when grid is active.

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: grid snap system with toggle"
```

---

### Task 9: Particle System

**Files:**
- Create: `src/effects/ParticleSystem.ts`
- Modify: `src/main.ts` (integrate into game loop)

**Step 1: Write `src/effects/ParticleSystem.ts`**

```typescript
interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  color: string
  alpha: number
  gravity: number
}

export class ParticleSystem {
  private particles: Particle[] = []

  emit(opts: {
    x: number
    y: number
    count: number
    color: string
    speed?: number
    spread?: number
    life?: number
    size?: number
    gravity?: number
  }) {
    const { x, y, count, color, speed = 3, spread = Math.PI * 2, life = 60, size = 3, gravity = 0.05 } = opts
    const baseAngle = -Math.PI / 2

    for (let i = 0; i < count; i++) {
      const angle = baseAngle + (Math.random() - 0.5) * spread
      const spd = speed * (0.5 + Math.random() * 0.5)
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        life,
        maxLife: life,
        size: size * (0.5 + Math.random()),
        color,
        alpha: 1,
        gravity,
      })
    }
  }

  emitExplosion(x: number, y: number, radius: number) {
    // Fire core
    this.emit({ x, y, count: 40, color: '#ff6b35', speed: radius * 0.08, life: 30, size: 5, gravity: 0.02 })
    // Sparks
    this.emit({ x, y, count: 20, color: '#ffd700', speed: radius * 0.12, life: 20, size: 2, gravity: 0.01 })
    // Smoke
    this.emit({ x, y, count: 15, color: '#555', speed: radius * 0.03, life: 80, size: 8, gravity: -0.01 })
  }

  emitDebris(x: number, y: number, color: string, count = 8) {
    this.emit({ x, y, count, color, speed: 4, life: 40, size: 4, gravity: 0.08 })
  }

  emitSparks(x: number, y: number) {
    this.emit({ x, y, count: 6, color: '#ffd700', speed: 5, life: 15, size: 1.5, gravity: 0.05 })
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]
      p.x += p.vx
      p.y += p.vy
      p.vy += p.gravity
      p.vx *= 0.98
      p.life--
      p.alpha = p.life / p.maxLife

      if (p.life <= 0) {
        this.particles.splice(i, 1)
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save()
    for (const p of this.particles) {
      ctx.globalAlpha = p.alpha
      ctx.fillStyle = p.color
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
  }

  get count() {
    return this.particles.length
  }
}
```

**Step 2: Integrate into game loop** — add `particleSystem.update()` and `particleSystem.draw(ctx)` inside the camera transform.

**Step 3: Verify**

Temporarily call `particleSystem.emitExplosion(600, 400, 100)` on click to test particles.

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: particle system with explosion, debris, smoke, and spark effects"
```

---

### Task 10: Destruction System + Explosion Mechanics

**Files:**
- Create: `src/physics/Destruction.ts`
- Create: `src/physics/Explosion.ts`
- Modify: `src/core/Engine.ts` (collision events)

**Step 1: Write `src/physics/Explosion.ts`**

```typescript
import Matter from 'matter-js'
import type { Engine } from '../core/Engine.ts'
import type { ParticleSystem } from '../effects/ParticleSystem.ts'

export function applyExplosion(
  engine: Engine,
  x: number,
  y: number,
  radius: number,
  force: number,
  particles: ParticleSystem,
) {
  const bodies = engine.getAllBodies()

  for (const body of bodies) {
    if (body.isStatic) continue

    const dx = body.position.x - x
    const dy = body.position.y - y
    const dist = Math.sqrt(dx * dx + dy * dy)

    if (dist < radius && dist > 0) {
      const intensity = 1 - dist / radius
      const fx = (dx / dist) * force * intensity
      const fy = (dy / dist) * force * intensity

      Matter.Body.applyForce(body, body.position, { x: fx, y: fy })
    }
  }

  particles.emitExplosion(x, y, radius)
}
```

**Step 2: Write `src/physics/Destruction.ts`**

```typescript
import Matter from 'matter-js'
import type { Engine } from '../core/Engine.ts'
import type { ParticleSystem } from '../effects/ParticleSystem.ts'
import { MATERIALS, type MaterialType } from './Materials.ts'

export class DestructionSystem {
  private engine: Engine
  private particles: ParticleSystem

  constructor(engine: Engine, particles: ParticleSystem) {
    this.engine = engine
    this.particles = particles
    this.setupCollisionEvents()
  }

  private setupCollisionEvents() {
    Matter.Events.on(this.engine.matterEngine, 'collisionStart', (event) => {
      for (const pair of event.pairs) {
        const impulse = pair.collision.depth
        this.checkFracture(pair.bodyA, impulse)
        this.checkFracture(pair.bodyB, impulse)
      }
    })
  }

  private checkFracture(body: Matter.Body, impulse: number) {
    if (body.isStatic) return
    const matType = body.label as MaterialType
    const mat = MATERIALS[matType]
    if (!mat) return

    // Use velocity-based impact estimation
    const speed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2)
    const impact = speed * (body.mass ?? 1)

    if (impact > mat.fractureThreshold) {
      this.fractureBody(body, mat.debrisColor)
    }
  }

  fractureBody(body: Matter.Body, debrisColor?: string) {
    const pos = body.position
    const color = debrisColor ?? '#888'

    // Remove original body
    this.engine.removeBody(body)

    // Create smaller debris pieces
    const bounds = body.bounds
    const w = bounds.max.x - bounds.min.x
    const h = bounds.max.y - bounds.min.y
    const pieces = Math.min(4, Math.max(2, Math.floor((w * h) / 400)))

    for (let i = 0; i < pieces; i++) {
      const size = Math.max(5, Math.min(w, h) / 2)
      const ox = (Math.random() - 0.5) * w * 0.5
      const oy = (Math.random() - 0.5) * h * 0.5

      const debris = Matter.Bodies.rectangle(pos.x + ox, pos.y + oy, size, size, {
        density: 0.002,
        friction: 0.3,
        restitution: 0.2,
        render: { fillStyle: color },
      })

      // Give debris some velocity
      Matter.Body.setVelocity(debris, {
        x: body.velocity.x + (Math.random() - 0.5) * 5,
        y: body.velocity.y + (Math.random() - 0.5) * 5,
      })

      this.engine.addBody(debris)
    }

    // Emit particles
    this.particles.emitDebris(pos.x, pos.y, color, 10)
  }
}
```

**Step 3: Integrate DestructionSystem into main.ts**

```typescript
const destruction = new DestructionSystem(engine, particleSystem)
```

**Step 4: Verify**

Build a tower, then drop heavy blocks from high up — blocks should fracture on hard impact.

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: destruction system with collision-based fracture and explosion mechanics"
```

---

### Task 11: Weapons — Bomb

**Files:**
- Create: `src/weapons/Bomb.ts`
- Modify: `src/main.ts`

**Step 1: Write `src/weapons/Bomb.ts`**

```typescript
import type { ToolHandler } from '../core/InputManager.ts'
import type { Engine } from '../core/Engine.ts'
import type { ParticleSystem } from '../effects/ParticleSystem.ts'
import { applyExplosion } from '../physics/Explosion.ts'

export class Bomb {
  radius = 120
  force = 0.05

  getToolHandler(engine: Engine, particles: ParticleSystem): ToolHandler {
    return {
      onMouseDown: (wx, wy) => {
        applyExplosion(engine, wx, wy, this.radius, this.force, particles)
      },
    }
  }
}
```

**Step 2: Wire bomb into main.ts** — when weapon "bomb" is selected, set the bomb's tool handler.

**Step 3: Verify**

Switch to destroy mode, select bomb, click on a structure — explosion applies force + particles.

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: bomb weapon with explosion shockwave"
```

---

### Task 12: Weapons — Cannon

**Files:**
- Create: `src/weapons/Cannon.ts`

**Step 1: Write `src/weapons/Cannon.ts`**

```typescript
import Matter from 'matter-js'
import type { ToolHandler } from '../core/InputManager.ts'
import type { Engine } from '../core/Engine.ts'

export class Cannon {
  force = 0.08

  getToolHandler(engine: Engine): ToolHandler {
    return {
      onMouseDown: (wx, wy) => {
        // Fire from left edge toward click point
        const startX = 0
        const startY = wy
        const dx = wx - startX
        const dy = wy - startY
        const dist = Math.sqrt(dx * dx + dy * dy)

        const ball = Matter.Bodies.circle(startX, startY, 15, {
          density: 0.05,
          friction: 0.3,
          restitution: 0.3,
          render: { fillStyle: '#2c3e50' },
        })

        Matter.Body.setVelocity(ball, {
          x: (dx / dist) * 30,
          y: (dy / dist) * 30,
        })

        engine.addBody(ball)
      },
    }
  }
}
```

**Step 2: Wire into main.ts weapon selection**

**Step 3: Verify + Commit**

```bash
git add -A && git commit -m "feat: cannon weapon fires projectiles from screen edge"
```

---

### Task 13: Weapons — Wrecking Ball

**Files:**
- Create: `src/weapons/WreckingBall.ts`

**Step 1: Write `src/weapons/WreckingBall.ts`**

```typescript
import Matter from 'matter-js'
import type { ToolHandler } from '../core/InputManager.ts'
import type { Engine } from '../core/Engine.ts'

export class WreckingBall {
  getToolHandler(engine: Engine): ToolHandler {
    return {
      onMouseDown: (wx, _wy) => {
        const ball = Matter.Bodies.circle(wx, -100, 30, {
          density: 0.1,
          friction: 0.5,
          restitution: 0.1,
          render: { fillStyle: '#1a1a2e' },
        })

        engine.addBody(ball)
      },
    }
  }
}
```

**Step 2: Wire + Verify + Commit**

```bash
git add -A && git commit -m "feat: wrecking ball weapon drops heavy ball from above"
```

---

### Task 14: Weapons — Laser

**Files:**
- Create: `src/weapons/Laser.ts`

**Step 1: Write `src/weapons/Laser.ts`**

The laser draws a cutting line and removes bodies it intersects, splitting them with the destruction system.

```typescript
import Matter from 'matter-js'
import type { ToolHandler } from '../core/InputManager.ts'
import type { Engine } from '../core/Engine.ts'
import type { DestructionSystem } from '../physics/Destruction.ts'

export class Laser {
  private startX = 0
  private startY = 0
  private endX = 0
  private endY = 0
  private cutting = false

  // Expose for rendering the laser line
  get isActive() { return this.cutting }
  get line() { return { x1: this.startX, y1: this.startY, x2: this.endX, y2: this.endY } }

  getToolHandler(engine: Engine, destruction: DestructionSystem): ToolHandler {
    return {
      onMouseDown: (wx, wy) => {
        this.startX = wx
        this.startY = wy
        this.endX = wx
        this.endY = wy
        this.cutting = true
      },
      onMouseMove: (wx, wy) => {
        if (this.cutting) {
          this.endX = wx
          this.endY = wy
        }
      },
      onMouseUp: () => {
        if (!this.cutting) return
        this.cutting = false

        // Find bodies intersecting the laser line
        const bodies = engine.getAllBodies()
        for (const body of bodies) {
          if (body.isStatic) continue
          if (this.lineIntersectsBody(body)) {
            destruction.fractureBody(body)
          }
        }
      },
    }
  }

  private lineIntersectsBody(body: Matter.Body): boolean {
    const vertices = body.vertices
    for (let i = 0; i < vertices.length; i++) {
      const j = (i + 1) % vertices.length
      if (this.segmentsIntersect(
        this.startX, this.startY, this.endX, this.endY,
        vertices[i].x, vertices[i].y, vertices[j].x, vertices[j].y,
      )) {
        return true
      }
    }
    return false
  }

  private segmentsIntersect(
    x1: number, y1: number, x2: number, y2: number,
    x3: number, y3: number, x4: number, y4: number,
  ): boolean {
    const d = (x2 - x1) * (y4 - y3) - (y2 - y1) * (x4 - x3)
    if (Math.abs(d) < 1e-10) return false

    const t = ((x3 - x1) * (y4 - y3) - (y3 - y1) * (x4 - x3)) / d
    const u = ((x3 - x1) * (y2 - y1) - (y3 - y1) * (x2 - x1)) / d

    return t >= 0 && t <= 1 && u >= 0 && u <= 1
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.cutting) return

    ctx.save()
    ctx.strokeStyle = '#00ff88'
    ctx.lineWidth = 2
    ctx.shadowColor = '#00ff88'
    ctx.shadowBlur = 10
    ctx.beginPath()
    ctx.moveTo(this.startX, this.startY)
    ctx.lineTo(this.endX, this.endY)
    ctx.stroke()
    ctx.restore()
  }
}
```

**Step 2: Wire laser into main.ts + draw laser line in render loop**

**Step 3: Verify + Commit**

```bash
git add -A && git commit -m "feat: laser weapon cuts bodies along drawn line"
```

---

### Task 15: Preset Structures

**Files:**
- Create: `src/building/Presets.ts`
- Modify: `src/ui/Toolbar.ts` (add preset buttons in build mode)

**Step 1: Write `src/building/Presets.ts`**

```typescript
import type { Engine } from '../core/Engine.ts'
import type { BuildSystem } from './BuildSystem.ts'

export const PresetType = {
  TOWER: 'tower',
  WALL: 'wall',
  BRIDGE: 'bridge',
} as const

export type PresetType = (typeof PresetType)[keyof typeof PresetType]

export function buildPreset(type: PresetType, x: number, y: number, buildSystem: BuildSystem, engine: Engine) {
  const saved = { mat: buildSystem.currentMaterial, shape: buildSystem.currentShape }

  switch (type) {
    case PresetType.TOWER:
      buildTower(x, y, buildSystem)
      break
    case PresetType.WALL:
      buildWall(x, y, buildSystem)
      break
    case PresetType.BRIDGE:
      buildBridge(x, y, buildSystem)
      break
  }

  buildSystem.currentMaterial = saved.mat
  buildSystem.currentShape = saved.shape
}

function buildTower(x: number, baseY: number, build: BuildSystem) {
  build.currentShape = 'rect'
  build.currentMaterial = 'brick'
  build.blockWidth = 80
  build.blockHeight = 20

  for (let row = 0; row < 8; row++) {
    const y = baseY - row * 22
    const offset = row % 2 === 0 ? 0 : 40
    build.placeBlock(x - 40 + offset, y)
    build.placeBlock(x + 40 + offset, y)
  }
}

function buildWall(x: number, baseY: number, build: BuildSystem) {
  build.currentShape = 'rect'
  build.currentMaterial = 'stone'
  build.blockWidth = 60
  build.blockHeight = 20

  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      const bx = x + (col - 2) * 62
      const by = baseY - row * 22
      build.placeBlock(bx, by)
    }
  }
}

function buildBridge(x: number, baseY: number, build: BuildSystem) {
  build.currentShape = 'rect'
  build.currentMaterial = 'wood'
  build.blockWidth = 100
  build.blockHeight = 15

  // Deck planks
  for (let i = 0; i < 5; i++) {
    build.placeBlock(x + (i - 2) * 102, baseY)
  }

  // Support pillars
  build.currentMaterial = 'steel'
  build.blockWidth = 15
  build.blockHeight = 60

  build.placeBlock(x - 200, baseY + 40)
  build.placeBlock(x + 200, baseY + 40)
  build.placeBlock(x, baseY + 40)
}
```

**Step 2: Add preset buttons to Toolbar.ts** in build mode section

**Step 3: Verify + Commit**

```bash
git add -A && git commit -m "feat: preset structures - tower, wall, and bridge"
```

---

### Task 16: Final Integration and Polish

**Files:**
- Modify: `src/main.ts` — wire everything together
- Modify: `src/core/Renderer.ts` — add ground line visual
- Modify: `src/core/Engine.ts` — wider ground

**Step 1: Update Engine ground** — make it wider (3000px) to accommodate panning

**Step 2: Add ground visual** — draw a visually distinct ground surface with gradient

**Step 3: Add HUD overlay** — show body count, particle count, FPS in top-right corner

**Step 4: Final main.ts** — ensure all weapons are properly wired, all modes switch correctly

**Step 5: Comprehensive verification**

Run: `pnpm dev` and test:
- [ ] Build mode: place wood/brick/stone/steel/glass blocks in rect/circle/triangle shapes
- [ ] Grid snap toggle with G key
- [ ] Preset structures generate correctly
- [ ] Destroy mode: bomb creates explosion with particles
- [ ] Cannon fires projectiles
- [ ] Wrecking ball drops from above
- [ ] Laser cuts bodies with green beam
- [ ] Fracture on high-speed collision produces debris + particles
- [ ] Camera pan (right-click) and zoom (scroll)
- [ ] Gravity and speed sliders work
- [ ] Pause/resume with Space
- [ ] Reset clears all bodies

**Step 6: Run `pnpm build`** to verify TypeScript compiles cleanly

**Step 7: Commit**

```bash
git add -A && git commit -m "feat: final integration - all systems wired and polished"
```

---

## Summary

| Task | Description | Key Files |
|------|-------------|-----------|
| 1 | Project setup + Canvas | main.ts, index.html, style.css |
| 2 | Engine + Renderer | core/Engine.ts, core/Renderer.ts |
| 3 | Camera (pan/zoom) | core/Camera.ts |
| 4 | Material system | physics/Materials.ts |
| 5 | Input manager | core/InputManager.ts |
| 6 | Build system | building/BuildSystem.ts |
| 7 | UI components | ui/TopBar.ts, Toolbar.ts, BottomBar.ts |
| 8 | Grid snap | building/Grid.ts |
| 9 | Particle system | effects/ParticleSystem.ts |
| 10 | Destruction + Explosion | physics/Destruction.ts, Explosion.ts |
| 11 | Bomb weapon | weapons/Bomb.ts |
| 12 | Cannon weapon | weapons/Cannon.ts |
| 13 | Wrecking ball | weapons/WreckingBall.ts |
| 14 | Laser weapon | weapons/Laser.ts |
| 15 | Preset structures | building/Presets.ts |
| 16 | Final integration | All files |
