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
