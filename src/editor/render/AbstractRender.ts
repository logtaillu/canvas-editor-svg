
export interface IAbstractRender {
  width: number
  height: number
}
export abstract class AbstractRender {
  abstract element: SVGElement | HTMLCanvasElement
  abstract ctx: CanvasRenderingContext2D | null
  translatePos = { x: 0, y: 0 }
  abstract get width(): number
  abstract set width(value: number)
  abstract get height(): number
  abstract set height(value: number)
  abstract toDataURL(): string
  abstract clear(width: number, height: number): void
  render() {
    // empty
  }
  abstract set globalAlpha(value: number)
  get style() {
    return this.element.style
  }
  setAttribute(name: string, value: string) {
    this.element.setAttribute(name, value)
  }

  abstract drawImage(
    image: HTMLImageElement | HTMLVideoElement,
    x: number,
    y: number,
    width: number,
    height: number
  ): void
  abstract fillRect(x: number, y: number, width: number, height: number): void
  abstract strokeRect(x: number, y: number, width: number, height: number): void
  abstract set fillStyle(value: string)
  abstract set strokeStyle(value: string)
  abstract save(shape?: keyof SVGElementTagNameMap): void
  abstract restore(): void
  abstract translate(x: number, y: number): void
  abstract translateBack(): void
  abstract begin(shape: keyof SVGElementTagNameMap): void
  abstract end(): void
  abstract set font(font: string)
  abstract fillText(text: string, x: number, y: number): void
  abstract set lineWidth(value: number)
  abstract get lineWidth(): number
  abstract beginPath(): void
  abstract setLineDash(lineDash: number[]): void
  abstract stroke(): void
  abstract lineTo(x: number, y: number): void
  abstract moveTo(x: number, y: number): void
  abstract rect(x: number, y: number, width: number, height: number): void
  abstract closePath(): void
  abstract arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: boolean): void
  abstract fill(): void
  abstract measureText(data: string, font: string): any
  abstract set lineCap(value: CanvasLineCap)
  abstract set lineJoin(value: CanvasLineJoin)
  abstract scale(x: number, y: number): void
  abstract getContext(): CanvasRenderingContext2D
  abstract rotate(angle: number): void
  abstract createPattern(canvas: HTMLCanvasElement, repeat: string, width: number, height: number): void
  abstract html(html: string): void
  abstract get current(): SVGElement | HTMLCanvasElement
}