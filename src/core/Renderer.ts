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
    this.ctx.setTransform(1, 0, 0, 1, 0, 0)
    this.ctx.fillStyle = '#16213e'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }

  drawPolygon(body: Matter.Body) {
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
    ctx.lineWidth = 1
    ctx.stroke()
  }

  drawCircle(body: Matter.Body) {
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
