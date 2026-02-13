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

  camera.resetTransform(renderer.ctx)

  requestAnimationFrame(gameLoop)
}

requestAnimationFrame(gameLoop)
