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
