export const GameMode = {
  BUILD: 'build',
  DESTROY: 'destroy',
} as const

export type GameMode = (typeof GameMode)[keyof typeof GameMode]

export class TopBar {
  element: HTMLDivElement
  private onModeChange: (mode: GameMode) => void
  private onReset: () => void
  private onPause: () => void
  private pauseBtn: HTMLButtonElement

  constructor(opts: {
    onModeChange: (mode: GameMode) => void
    onReset: () => void
    onPause: () => void
  }) {
    this.onModeChange = opts.onModeChange
    this.onReset = opts.onReset
    this.onPause = opts.onPause

    this.element = document.createElement('div')
    this.element.className = 'top-bar'

    const buildBtn = this.createBtn('build-btn active', '搭建', () => this.setMode(GameMode.BUILD))
    const destroyBtn = this.createBtn('destroy-btn', '破坏', () => this.setMode(GameMode.DESTROY))
    const resetBtn = this.createBtn('reset-btn', '重置', () => this.onReset())
    this.pauseBtn = this.createBtn('pause-btn', '暂停', () => this.onPause())

    const modeGroup = document.createElement('div')
    modeGroup.className = 'btn-group'
    modeGroup.append(buildBtn, destroyBtn)

    const actionGroup = document.createElement('div')
    actionGroup.className = 'btn-group'
    actionGroup.append(resetBtn, this.pauseBtn)

    this.element.append(modeGroup, actionGroup)
  }

  setMode(mode: GameMode) {
    this.element.querySelectorAll('.mode-btn').forEach((btn) => btn.classList.remove('active'))
    this.element.querySelector(`.${mode}-btn`)?.classList.add('active')
    this.onModeChange(mode)
  }

  setPauseLabel(paused: boolean) {
    this.pauseBtn.textContent = paused ? '继续' : '暂停'
  }

  private createBtn(cls: string, text: string, onClick: () => void): HTMLButtonElement {
    const btn = document.createElement('button')
    btn.className = `ui-btn mode-btn ${cls}`
    btn.textContent = text
    btn.addEventListener('click', onClick)
    return btn
  }
}
