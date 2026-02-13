export const MaterialType = {
  WOOD: 'wood',
  BRICK: 'brick',
  STONE: 'stone',
  STEEL: 'steel',
  GLASS: 'glass',
} as const

export type MaterialType = (typeof MaterialType)[keyof typeof MaterialType]

export interface MaterialDef {
  type: MaterialType
  label: string
  density: number
  friction: number
  restitution: number
  fractureThreshold: number
  color: string
  strokeColor: string
  debrisColor: string
}

export const MATERIALS: Record<MaterialType, MaterialDef> = {
  wood: {
    type: MaterialType.WOOD,
    label: '木材',
    density: 0.004,
    friction: 0.6,
    restitution: 0.2,
    fractureThreshold: 5,
    color: '#8B6914',
    strokeColor: '#6B4F12',
    debrisColor: '#A0782C',
  },
  brick: {
    type: MaterialType.BRICK,
    label: '砖块',
    density: 0.008,
    friction: 0.7,
    restitution: 0.1,
    fractureThreshold: 10,
    color: '#C0392B',
    strokeColor: '#962D22',
    debrisColor: '#D4574A',
  },
  stone: {
    type: MaterialType.STONE,
    label: '石材',
    density: 0.012,
    friction: 0.8,
    restitution: 0.05,
    fractureThreshold: 20,
    color: '#7F8C8D',
    strokeColor: '#616A6B',
    debrisColor: '#95A5A6',
  },
  steel: {
    type: MaterialType.STEEL,
    label: '钢铁',
    density: 0.02,
    friction: 0.4,
    restitution: 0.3,
    fractureThreshold: 50,
    color: '#BDC3C7',
    strokeColor: '#95A5A6',
    debrisColor: '#D5DBDB',
  },
  glass: {
    type: MaterialType.GLASS,
    label: '玻璃',
    density: 0.006,
    friction: 0.2,
    restitution: 0.4,
    fractureThreshold: 2,
    color: 'rgba(174, 214, 241, 0.6)',
    strokeColor: 'rgba(133, 193, 233, 0.8)',
    debrisColor: 'rgba(174, 214, 241, 0.8)',
  },
}

export function getMaterialOptions(type: MaterialType) {
  const mat = MATERIALS[type]
  return {
    density: mat.density,
    friction: mat.friction,
    restitution: mat.restitution,
    render: { fillStyle: mat.color },
    label: mat.type,
  }
}
