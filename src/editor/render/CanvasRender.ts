import { AbstractRender, IAbstractRender } from './AbstractRender'

export default class CanvasRender extends AbstractRender {
  element: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  constructor(options: IAbstractRender) {
    super()
    const { width, height } = options
    const canvas = document.createElement('canvas')
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    this.element = canvas
    this.ctx = this.element.getContext('2d')!

  }
  get width() {
    return this.element.width
  }
  set width(value: number) {
    this.element.width = value
  }
  get height() {
    return this.element.height
  }
  set height(value: number) {
    this.element.height = value
  }
  toDataURL(): string {
    return this.element.toDataURL()
  }
  clear(width: number, height: number): void {
    this.ctx.clearRect(0, 0, Math.max(this.width, width), Math.max(this.height, height))
  }

  drawImage(image: HTMLImageElement | HTMLVideoElement, x: number, y: number, width: number, height: number): void {
    this.ctx.drawImage(image, x, y, width, height)
  }

  save() {
    this.ctx.save()
  }

  set globalAlpha(value: number) {
    this.ctx.globalAlpha = value
  }
  set fillStyle(value: string) {
    this.ctx.fillStyle = value
  }
  set strokeStyle(value: string) {
    this.ctx.strokeStyle = value
  }
  fillRect(x: number, y: number, width: number, height: number) {
    this.ctx.fillRect(x, y, width, height)
  }
  strokeRect(x: number, y: number, width: number, height: number): void {
    this.ctx.strokeRect(x, y, width, height)
  }
  restore() {
    this.ctx.restore()
  }

  translate(x: number, y: number) {
    this.ctx.translate(x, y)
    this.translatePos = { x: -x, y: -y }
  }
  translateBack(): void {
    this.translate(this.translatePos.x, this.translatePos.y)
  }

  begin() {
    // empty
  }
  end() {
    // empty
  }
  set font(font: string) {
    this.ctx.font = font
  }
  fillText(text: string, x: number, y: number): void {
    this.ctx.fillText(text, x, y)
  }

  set lineWidth(value: number) {
    this.ctx.lineWidth = value
  }
  get lineWidth() {
    return this.ctx.lineWidth
  }

  beginPath(): void {
    this.ctx.beginPath()
  }
  setLineDash(lineDash: number[]): void {
    this.ctx.setLineDash(lineDash)
  }
  stroke(): void {
    this.ctx.stroke()
  }
  lineTo(x: number, y: number): void {
    this.ctx.lineTo(x, y)
  }
  moveTo(x: number, y: number): void {
    this.ctx.moveTo(x, y)
  }
  rect(x: number, y: number, width: number, height: number) {
    this.ctx.rect(x, y, width, height)
  }
  closePath(): void {
    this.ctx.closePath()
  }
  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: boolean) {
    this.ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise)
  }
  fill(): void {
    this.ctx.fill()
  }
  measureText(data: string, font: string) {
    this.ctx.font = font
    return this.ctx.measureText(data)
  }

  set lineCap(value: CanvasLineCap) {
    this.ctx.lineCap = value
  }
  set lineJoin(value: CanvasLineJoin) {
    this.ctx.lineJoin = value
  }

  scale(x: number, y: number): void {
    this.ctx.scale(x, y)
  }
  rotate(angle: number) {
    this.ctx.rotate(angle)
  }
  getContext(): CanvasRenderingContext2D {
    return this.ctx
  }
  createPattern(canvas: HTMLCanvasElement, repeat: string, width: number, height: number) {
    const pattern = this.ctx.createPattern(canvas, repeat)
    if (pattern) {
      this.ctx.fillStyle = pattern
      this.ctx.fillRect(0, 0, width, height)
    }
  }
  html() {
    // do nothing
  }
  get current() {
    return this.element
  }
}