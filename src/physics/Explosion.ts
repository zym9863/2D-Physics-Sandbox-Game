import Matter from 'matter-js'
import type { Engine } from '../core/Engine.ts'
import type { ParticleSystem } from '../effects/ParticleSystem.ts'

export function applyExplosion(
  engine: Engine,
  x: number,
  y: number,
  radius: number,
  force: number,
  particles: ParticleSystem,
) {
  const bodies = engine.getAllBodies()

  for (const body of bodies) {
    if (body.isStatic) continue

    const dx = body.position.x - x
    const dy = body.position.y - y
    const dist = Math.sqrt(dx * dx + dy * dy)

    if (dist < radius && dist > 0) {
      const intensity = 1 - dist / radius
      const fx = (dx / dist) * force * intensity
      const fy = (dy / dist) * force * intensity

      Matter.Body.applyForce(body, body.position, { x: fx, y: fy })
    }
  }

  particles.emitExplosion(x, y, radius)
}
