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

// UI
const topBar = new TopBar({
  onModeChange: (mode) => {
    if (mode === GameMode.BUILD) {
      toolbar.showBuildTools()
      input.setToolHandler(buildSystem.getToolHandler())
    } else {
      toolbar.showDestroyTools()
      input.setToolHandler(null) // Weapon handlers added in later tasks
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
  onSelectWeapon: (_type: string) => {
    input.setToolHandler(null) // Weapon tool handlers added in later tasks
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
