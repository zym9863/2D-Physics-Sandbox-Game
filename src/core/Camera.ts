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
