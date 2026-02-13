import Matter from 'matter-js'

export class Engine {
  matterEngine: Matter.Engine
  world: Matter.World
  private running = true

  constructor() {
    this.matterEngine = Matter.Engine.create({
      gravity: { x: 0, y: 1, scale: 0.001 },
    })
    this.world = this.matterEngine.world

    // Ground — wide enough for panning
    const ground = Matter.Bodies.rectangle(600, 580, 3000, 40, {
      isStatic: true,
      render: { fillStyle: '#2d3436' },
    })
    Matter.Composite.add(this.world, ground)
  }

  update(delta: number) {
    if (!this.running) return
    Matter.Engine.update(this.matterEngine, delta)
  }

  addBody(body: Matter.Body) {
    Matter.Composite.add(this.world, body)
  }

  removeBody(body: Matter.Body) {
    Matter.Composite.remove(this.world, body)
  }

  getAllBodies(): Matter.Body[] {
    return Matter.Composite.allBodies(this.world)
  }

  togglePause() {
    this.running = !this.running
    return this.running
  }

  get isPaused() {
    return !this.running
  }

  clear() {
    Matter.Composite.clear(this.world, false)
    // Re-add ground
    const ground = Matter.Bodies.rectangle(600, 580, 3000, 40, {
      isStatic: true,
      render: { fillStyle: '#2d3436' },
    })
    Matter.Composite.add(this.world, ground)
  }
}
