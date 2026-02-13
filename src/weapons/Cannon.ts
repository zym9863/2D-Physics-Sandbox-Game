import Matter from 'matter-js'
import type { ToolHandler } from '../core/InputManager.ts'
import type { Engine } from '../core/Engine.ts'

export class Cannon {
  force = 30

  getToolHandler(engine: Engine): ToolHandler {
    return {
      onMouseDown: (wx, wy) => {
        // Fire from left edge toward click point
        const startX = 0
        const startY = wy
        const dx = wx - startX
        const dy = wy - startY
        const dist = Math.sqrt(dx * dx + dy * dy)

        const ball = Matter.Bodies.circle(startX, startY, 15, {
          density: 0.05,
          friction: 0.3,
          restitution: 0.3,
          render: { fillStyle: '#2c3e50' },
        })

        Matter.Body.setVelocity(ball, {
          x: (dx / dist) * this.force,
          y: (dy / dist) * this.force,
        })

        engine.addBody(ball)
      },
    }
  }
}
