export class BottomBar {
  element: HTMLDivElement

  constructor(opts: {
    onGravityChange: (value: number) => void
    onSpeedChange: (value: number) => void
  }) {
    this.element = document.createElement('div')
    this.element.className = 'bottom-bar'

    this.element.innerHTML = `
      <div class="control-group">
        <label>▸ 重力</label>
        <input type="range" id="gravity-slider" min="0" max="3" step="0.1" value="1" />
        <span id="gravity-value">1.0</span>
      </div>
      <div class="control-group">
        <label>⚡ 速度</label>
        <input type="range" id="speed-slider" min="0.1" max="3" step="0.1" value="1" />
        <span id="speed-value">1.0</span>
      </div>
      <div class="control-group" style="margin-left: auto; opacity: 0.6;">
        <span style="font-size: 10px; letter-spacing: 1px;">SPACE 暂停 · G 网格</span>
      </div>
    `

    const gravSlider = this.element.querySelector('#gravity-slider') as HTMLInputElement
    const gravLabel = this.element.querySelector('#gravity-value') as HTMLSpanElement
    gravSlider.addEventListener('input', () => {
      const v = parseFloat(gravSlider.value)
      gravLabel.textContent = v.toFixed(1)
      opts.onGravityChange(v)
    })

    const speedSlider = this.element.querySelector('#speed-slider') as HTMLInputElement
    const speedLabel = this.element.querySelector('#speed-value') as HTMLSpanElement
    speedSlider.addEventListener('input', () => {
      const v = parseFloat(speedSlider.value)
      speedLabel.textContent = v.toFixed(1)
      opts.onSpeedChange(v)
    })
  }
}
