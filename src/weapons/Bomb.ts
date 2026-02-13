import type { ToolHandler } from '../core/InputManager.ts'
import type { Engine } from '../core/Engine.ts'
import type { ParticleSystem } from '../effects/ParticleSystem.ts'
import { applyExplosion } from '../physics/Explosion.ts'

export class Bomb {
  radius = 120
  force = 0.05

  getToolHandler(engine: Engine, particles: ParticleSystem): ToolHandler {
    return {
      onMouseDown: (wx, wy) => {
        applyExplosion(engine, wx, wy, this.radius, this.force, particles)
      },
    }
  }
}
