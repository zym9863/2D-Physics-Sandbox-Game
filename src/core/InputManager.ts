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
