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
  const delta = lastTime ? Math.min(time - lastTime, 32) : 16.67
  lastTime = time

  engine.update(delta)
  renderer.clear()

  const bodies = engine.getAllBodies()
  for (const body of bodies) {
    if (body.circleRadius) {
      renderer.drawCircle(body)
    } else {
      renderer.drawPolygon(body)
    }
  }

  requestAnimationFrame(gameLoop)
}

requestAnimationFrame(gameLoop)
