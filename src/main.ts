import './style.css'

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement
const ctx = canvas.getContext('2d')!

function resize() {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}

resize()
window.addEventListener('resize', resize)

// Temp: draw something to verify canvas works
ctx.fillStyle = '#16213e'
ctx.fillRect(0, 0, canvas.width, canvas.height)
ctx.fillStyle = '#e94560'
ctx.font = '48px system-ui'
ctx.textAlign = 'center'
ctx.fillText('2D Physics Sandbox', canvas.width / 2, canvas.height / 2)
