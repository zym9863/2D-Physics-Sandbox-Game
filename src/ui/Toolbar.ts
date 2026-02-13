import { MATERIALS, type MaterialType } from '../physics/Materials.ts'
import { ShapeType } from '../building/BuildSystem.ts'
import { PresetType } from '../building/Presets.ts'

interface ToolItem {
  id: string
  label: string
  icon: string
  group: 'material' | 'shape' | 'weapon'
}

const MATERIAL_TOOLS: ToolItem[] = Object.values(MATERIALS).map((m) => ({
  id: m.type,
  label: m.label,
  icon: m.color,
  group: 'material' as const,
}))

const SHAPE_TOOLS: ToolItem[] = [
  { id: ShapeType.RECT, label: '矩形', icon: '▬', group: 'shape' },
  { id: ShapeType.CIRCLE, label: '圆形', icon: '●', group: 'shape' },
  { id: ShapeType.TRIANGLE, label: '三角', icon: '▲', group: 'shape' },
]

const WEAPON_TOOLS: ToolItem[] = [
  { id: 'bomb', label: '炸弹', icon: '💣', group: 'weapon' },
  { id: 'cannon', label: '大炮', icon: '🔫', group: 'weapon' },
  { id: 'ball', label: '铁球', icon: '⚫', group: 'weapon' },
  { id: 'laser', label: '激光', icon: '⚡', group: 'weapon' },
]

const PRESET_TOOLS: ToolItem[] = [
  { id: PresetType.TOWER, label: '塔楼', icon: '🏗', group: 'shape' },
  { id: PresetType.WALL, label: '墙壁', icon: '🧱', group: 'shape' },
  { id: PresetType.BRIDGE, label: '桥梁', icon: '🌉', group: 'shape' },
]

export class Toolbar {
  element: HTMLDivElement
  private onSelectMaterial: (type: MaterialType) => void
  private onSelectShape: (type: ShapeType) => void
  private onSelectWeapon: (type: string) => void
  private onSelectPreset: (type: PresetType) => void

  constructor(opts: {
    onSelectMaterial: (type: MaterialType) => void
    onSelectShape: (type: ShapeType) => void
    onSelectWeapon: (type: string) => void
    onSelectPreset: (type: PresetType) => void
  }) {
    this.onSelectMaterial = opts.onSelectMaterial
    this.onSelectShape = opts.onSelectShape
    this.onSelectWeapon = opts.onSelectWeapon
    this.onSelectPreset = opts.onSelectPreset

    this.element = document.createElement('div')
    this.element.className = 'toolbar'
    this.renderBuildTools()
  }

  showBuildTools() {
    this.renderBuildTools()
  }

  showDestroyTools() {
    this.renderDestroyTools()
  }

  private renderBuildTools() {
    this.element.innerHTML = ''

    this.addSection('材质')
    for (const tool of MATERIAL_TOOLS) {
      this.addTool(tool, () => {
        this.setActive(tool.id)
        this.onSelectMaterial(tool.id as MaterialType)
      })
    }

    this.addSection('形状')
    for (const tool of SHAPE_TOOLS) {
      this.addTool(tool, () => {
        this.setActive(tool.id)
        this.onSelectShape(tool.id as ShapeType)
      })
    }

    this.addSection('预设')
    for (const tool of PRESET_TOOLS) {
      this.addTool(tool, () => this.onSelectPreset(tool.id as PresetType))
    }

    this.setActive('wood')
  }

  private renderDestroyTools() {
    this.element.innerHTML = ''

    this.addSection('武器')
    for (const tool of WEAPON_TOOLS) {
      this.addTool(tool, () => {
        this.setActive(tool.id)
        this.onSelectWeapon(tool.id)
      })
    }

    this.setActive('bomb')
  }

  private addSection(title: string) {
    const h = document.createElement('div')
    h.className = 'toolbar-section'
    h.textContent = title
    this.element.appendChild(h)
  }

  private addTool(tool: ToolItem, onClick: () => void) {
    const btn = document.createElement('button')
    btn.className = 'toolbar-item'
    btn.dataset.toolId = tool.id

    if (tool.group === 'material') {
      const swatch = document.createElement('span')
      swatch.className = 'color-swatch'
      swatch.style.backgroundColor = tool.icon
      btn.appendChild(swatch)
    } else {
      const icon = document.createElement('span')
      icon.className = 'tool-icon'
      icon.textContent = tool.icon
      btn.appendChild(icon)
    }

    const label = document.createElement('span')
    label.className = 'tool-label'
    label.textContent = tool.label
    btn.appendChild(label)

    btn.addEventListener('click', onClick)
    this.element.appendChild(btn)
  }

  private setActive(id: string) {
    this.element.querySelectorAll('.toolbar-item').forEach((el) => el.classList.remove('active'))
    this.element.querySelector(`[data-tool-id="${id}"]`)?.classList.add('active')
  }
}
