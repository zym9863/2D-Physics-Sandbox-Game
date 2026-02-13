import Matter from 'matter-js'
import type { Engine } from '../core/Engine.ts'
import type { ParticleSystem } from '../effects/ParticleSystem.ts'
import { MATERIALS, type MaterialType } from './Materials.ts'

export class DestructionSystem {
  private engine: Engine
  private particles: ParticleSystem

  constructor(engine: Engine, particles: ParticleSystem) {
    this.engine = engine
    this.particles = particles
    this.setupCollisionEvents()
  }

  private setupCollisionEvents() {
    Matter.Events.on(this.engine.matterEngine, 'collisionStart', (event) => {
      for (const pair of event.pairs) {
        this.checkFracture(pair.bodyA)
        this.checkFracture(pair.bodyB)
      }
    })
  }

  private checkFracture(body: Matter.Body) {
    if (body.isStatic) return
    const matType = body.label as MaterialType
    const mat = MATERIALS[matType]
    if (!mat) return

    const speed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2)
    const impact = speed * (body.mass ?? 1)

    if (impact > mat.fractureThreshold) {
      this.fractureBody(body, mat.debrisColor)
    }
  }

  fractureBody(body: Matter.Body, debrisColor?: string) {
    const pos = body.position
    const color = debrisColor ?? '#888'

    this.engine.removeBody(body)

    const bounds = body.bounds
    const w = bounds.max.x - bounds.min.x
    const h = bounds.max.y - bounds.min.y
    const pieces = Math.min(4, Math.max(2, Math.floor((w * h) / 400)))

    for (let i = 0; i < pieces; i++) {
      const size = Math.max(5, Math.min(w, h) / 2)
      const ox = (Math.random() - 0.5) * w * 0.5
      const oy = (Math.random() - 0.5) * h * 0.5

      const debris = Matter.Bodies.rectangle(pos.x + ox, pos.y + oy, size, size, {
        density: 0.002,
        friction: 0.3,
        restitution: 0.2,
        render: { fillStyle: color },
      })

      Matter.Body.setVelocity(debris, {
        x: body.velocity.x + (Math.random() - 0.5) * 5,
        y: body.velocity.y + (Math.random() - 0.5) * 5,
      })

      this.engine.addBody(debris)
    }

    this.particles.emitDebris(pos.x, pos.y, color, 10)
  }
}
