import type { BuildSystem } from './BuildSystem.ts'

export const PresetType = {
  TOWER: 'tower',
  WALL: 'wall',
  BRIDGE: 'bridge',
} as const

export type PresetType = (typeof PresetType)[keyof typeof PresetType]

export function buildPreset(type: PresetType, x: number, y: number, buildSystem: BuildSystem) {
  const savedMat = buildSystem.currentMaterial
  const savedShape = buildSystem.currentShape
  const savedW = buildSystem.blockWidth
  const savedH = buildSystem.blockHeight

  switch (type) {
    case PresetType.TOWER:
      buildTower(x, y, buildSystem)
      break
    case PresetType.WALL:
      buildWall(x, y, buildSystem)
      break
    case PresetType.BRIDGE:
      buildBridge(x, y, buildSystem)
      break
  }

  // Restore previous settings
  buildSystem.currentMaterial = savedMat
  buildSystem.currentShape = savedShape
  buildSystem.blockWidth = savedW
  buildSystem.blockHeight = savedH
}

function buildTower(x: number, baseY: number, build: BuildSystem) {
  build.currentShape = 'rect'
  build.currentMaterial = 'brick'
  build.blockWidth = 80
  build.blockHeight = 20

  for (let row = 0; row < 8; row++) {
    const y = baseY - row * 22
    const offset = row % 2 === 0 ? 0 : 40
    build.placeBlock(x - 40 + offset, y)
    build.placeBlock(x + 40 + offset, y)
  }
}

function buildWall(x: number, baseY: number, build: BuildSystem) {
  build.currentShape = 'rect'
  build.currentMaterial = 'stone'
  build.blockWidth = 60
  build.blockHeight = 20

  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      const bx = x + (col - 2) * 62
      const by = baseY - row * 22
      build.placeBlock(bx, by)
    }
  }
}

function buildBridge(x: number, baseY: number, build: BuildSystem) {
  build.currentShape = 'rect'

  // Deck planks
  build.currentMaterial = 'wood'
  build.blockWidth = 100
  build.blockHeight = 15
  for (let i = 0; i < 5; i++) {
    build.placeBlock(x + (i - 2) * 102, baseY)
  }

  // Support pillars
  build.currentMaterial = 'steel'
  build.blockWidth = 15
  build.blockHeight = 60
  build.placeBlock(x - 200, baseY + 40)
  build.placeBlock(x + 200, baseY + 40)
  build.placeBlock(x, baseY + 40)
}
