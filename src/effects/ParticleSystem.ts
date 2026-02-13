interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  color: string
  alpha: number
  gravity: number
}

export class ParticleSystem {
  private particles: Particle[] = []

  emit(opts: {
    x: number
    y: number
    count: number
    color: string
    speed?: number
    spread?: number
    life?: number
    size?: number
    gravity?: number
  }) {
    const { x, y, count, color, speed = 3, spread = Math.PI * 2, life = 60, size = 3, gravity = 0.05 } = opts
    const baseAngle = -Math.PI / 2

    for (let i = 0; i < count; i++) {
      const angle = baseAngle + (Math.random() - 0.5) * spread
      const spd = speed * (0.5 + Math.random() * 0.5)
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        life,
        maxLife: life,
        size: size * (0.5 + Math.random()),
        color,
        alpha: 1,
        gravity,
      })
    }
  }

  emitExplosion(x: number, y: number, radius: number) {
    // Fire core
    this.emit({ x, y, count: 40, color: '#ff6b35', speed: radius * 0.08, life: 30, size: 5, gravity: 0.02 })
    // Sparks
    this.emit({ x, y, count: 20, color: '#ffd700', speed: radius * 0.12, life: 20, size: 2, gravity: 0.01 })
    // Smoke
    this.emit({ x, y, count: 15, color: '#555', speed: radius * 0.03, life: 80, size: 8, gravity: -0.01 })
  }

  emitDebris(x: number, y: number, color: string, count = 8) {
    this.emit({ x, y, count, color, speed: 4, life: 40, size: 4, gravity: 0.08 })
  }

  emitSparks(x: number, y: number) {
    this.emit({ x, y, count: 6, color: '#ffd700', speed: 5, life: 15, size: 1.5, gravity: 0.05 })
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]
      p.x += p.vx
      p.y += p.vy
      p.vy += p.gravity
      p.vx *= 0.98
      p.life--
      p.alpha = p.life / p.maxLife

      if (p.life <= 0) {
        this.particles.splice(i, 1)
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save()
    for (const p of this.particles) {
      ctx.globalAlpha = p.alpha
      ctx.fillStyle = p.color
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
  }

  get count() {
    return this.particles.length
  }
}
