import type Matter from 'matter-js'
import type { ToolHandler } from '../core/InputManager.ts'
import type { Engine } from '../core/Engine.ts'
import type { DestructionSystem } from '../physics/Destruction.ts'

export class Laser {
  private startX = 0
  private startY = 0
  private endX = 0
  private endY = 0
  private cutting = false

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
