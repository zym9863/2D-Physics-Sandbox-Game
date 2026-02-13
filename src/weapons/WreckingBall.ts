import Matter from 'matter-js'
import type { ToolHandler } from '../core/InputManager.ts'
import type { Engine } from '../core/Engine.ts'

export class WreckingBall {
  getToolHandler(engine: Engine): ToolHandler {
    return {
      onMouseDown: (wx) => {
        const ball = Matter.Bodies.circle(wx, -100, 30, {
          density: 0.1,
          friction: 0.5,
          restitution: 0.1,
          render: { fillStyle: '#1a1a2e' },
        })

        engine.addBody(ball)
      },
    }
  }
}
