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
