import { CanvasPath2SvgPath, createSVGElement } from '../utils/svg'
import { AbstractRender, IAbstractRender } from './AbstractRender'
import {nanoid} from 'nanoid'
import morphdom from 'morphdom'
export default class SvgRender extends AbstractRender {
  element: SVGElement
  ctx: CanvasRenderingContext2D | null = null
  stack: Array<SVGElement> = []
  // 当前元素
  currentElement: SVGElement
  pathCtx: CanvasPath2SvgPath | null = null
  // 缓存旧元素
  oldElement: SVGElement | null = null
  cacheMap: Map<string, HTMLElement> = new Map()
  constructor(options: IAbstractRender) {
    super()
    const { width, height } = options
    const svg = createSVGElement('svg')
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    svg.setAttribute('width', `${width}`)
    svg.setAttribute('height', `${height}`)
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`)
    svg.style.width = `${width}px`
    svg.style.height = `${height}px`
    svg.classList.add('svg-page')
    this.element = svg
    this.currentElement = svg
  }
  get current() {
    return this.currentElement
  }
  get width() {
    return Number(this.element.getAttribute('width'))
  }
  set width(value: number) {
    this.element.setAttribute('width', value.toString())
    this.element.setAttribute('viewBox', `0 0 ${value} ${this.height}`)
  }
  get height() {
    return Number(this.element.getAttribute('height'))
  }
  set height(value: number) {
    this.element.setAttribute('height', value.toString())
    this.element.setAttribute('viewBox', `0 0 ${this.width} ${value}`)
  }
  toDataURL(): string {
    return this.element.outerHTML
  }
  clear(): void {
    this.cacheMap.clear()
    this.oldElement = this.element
    const svg = this.element.cloneNode(false) as SVGElement
    this.element = svg
    this.currentElement = svg
  }

  render() {
    if (this.oldElement) {
      const cacheMap = this.cacheMap
      morphdom(this.oldElement, this.element, {
        onBeforeElUpdated(fromEl, toEl) {
          if (toEl.dataset.cacheId) {
            const realNode = cacheMap.get(toEl.dataset.cacheId)!
            if (fromEl.isEqualNode(realNode)) {
              return false
            } else {
              fromEl.replaceWith(realNode)
              return false
            }
          }
          return true
        },
      })
      this.element = this.oldElement
      this.currentElement = this.oldElement
      this.oldElement = null
    }
  }

  drawImage(image: HTMLImageElement | HTMLVideoElement, x: number, y: number, width: number, height: number): void {
    if (this.currentElement.tagName.toLocaleLowerCase() !== 'image') {
      this.begin('image')
    }
    const img = this.currentElement
    img.setAttribute('href', image.src)
    img.setAttribute('x', x.toString())
    img.setAttribute('y', y.toString())
    img.setAttribute('width', width.toString())
    img.setAttribute('height', height.toString())
    this.end()
  }
  set globalAlpha(value: number) {
    this.currentElement.style.opacity = value.toString()
  }
  set fillStyle(value: string) {
    this.currentElement.style.fill = value
  }
  set strokeStyle(value: string) {
    this.currentElement.style.stroke = value
  }
  emptyBlocks = 0
  // 创建新元素
  save(shape?: keyof SVGElementTagNameMap) {
    if (!shape) {
      this.emptyBlocks += 1
      return
    }
    if (this.currentElement !== this.element) {
      // 推入栈
      this.stack.push(this.currentElement)
    }
    this.currentElement = createSVGElement(shape)
    if (shape === 'path') {
      this.pathCtx = new CanvasPath2SvgPath()
    }
  }
  fillRect(x: number, y: number, width: number, height: number, autoStroke = true) {
    if (this.currentElement.tagName.toLowerCase() !== 'rect' && this.beginByPath) {
      // 元素替换
      const rect = createSVGElement('rect')
      rect.style.cssText = this.currentElement.style.cssText
      this.currentElement = rect
      this.pathCtx = null
    }
    this.currentElement.setAttribute('x', x.toString())
    this.currentElement.setAttribute('y', y.toString())
    this.currentElement.setAttribute('width', width.toString())
    this.currentElement.setAttribute('height', height.toString())
    if (this.beginByPath && autoStroke) {
      this.stroke()
    }
  }
  strokeRect(x: number, y: number, width: number, height: number, autoStroke = true): void {
    this.fillStyle = 'none'
    this.fillRect(x, y, width, height, autoStroke)
  }
  // append回去
  restore() {
    if (this.emptyBlocks) {
      this.emptyBlocks -= 1
      return
    }
    const current = this.currentElement
    if (this.stack.length) {
      this.currentElement = this.stack.pop()!
    } else {
      this.currentElement = this.element
    }
    if (this.currentElement !== current) {
      if (current.tagName === 'path') {
        const svgPath = this.pathCtx?.toString() || ''
        current.setAttribute('d', svgPath)
        this.pathCtx = null
        if (svgPath) {
          this.currentElement.append(current)
        }
      } else {
        this.currentElement.append(current)
      }
    }
  }

  translate(x: number, y: number): void {
    this.currentElement.style.transform = `translate(${x}px, ${y}px)`
  }

  translateBack(): void {
    // empty
  }
  // 因为这里ctx不需要save和restore，所以svg额外提供了函数
  begin(shape: keyof SVGElementTagNameMap) {
    this.save(shape)
  }
  end() {
    this.restore()
  }

  set font(font: string) {
    this.currentElement.style.font = font
  }

  fillText(text: string, x: number, y: number): void {
    this.currentElement.setAttribute('x', x.toString())
    this.currentElement.setAttribute('y', y.toString())
    this.currentElement.append(document.createTextNode(text))
  }

  set lineWidth(value: number) {
    this.currentElement.style.strokeWidth = value.toString()
  }
  get lineWidth() {
    return Number(this.currentElement.style.strokeWidth)
  }
  get parentElement() {
    if (this.stack.length) {
      return this.stack[this.stack.length - 1]
    } else {
      return this.element
    }
  }
  beginByPath = false
  // 开始路径，先创建path，已经是path了就跳过
  beginPath(): void {
    const tag = this.currentElement.tagName.toLowerCase()
    if (tag !== 'path' && tag !== 'line') {
      this.beginByPath = true
      this.save('path')
      this.fillStyle = 'none'
    }
  }

  setLineDash(lineDash: number[]): void {
    this.currentElement.style.strokeDasharray = lineDash.join(',')
  }
  lineTo(x: number, y: number): void {
    const tag = this.currentElement.tagName.toLowerCase()
    if (tag === 'line') {
      this.currentElement.setAttribute('x2', `${x}`)
      this.currentElement.setAttribute('y2', `${y}`)
      return
    }
    if (!this.pathCtx) {
      this.beginPath()
    }
    if (this.pathCtx) {
      this.pathCtx.lineTo(x, y)
    }
  }
  moveTo(x: number, y: number): void {
    const tag = this.currentElement.tagName.toLowerCase()
    if (tag === 'line') {
      this.currentElement.setAttribute('x1', `${x}`)
      this.currentElement.setAttribute('y1', `${y}`)
      return
    }
    if (!this.pathCtx) {
      this.beginPath()
    }
    if (this.pathCtx) {
      this.pathCtx.moveTo(x, y)
    }
  }
  // 如果是save开始的，这里就跳过，让后面的restore推入
  stroke(): void {
    if (this.beginByPath) {
      this.restore()
      this.beginByPath = false
    }
  }
  rect(x: number, y: number, width: number, height: number) {
    this.strokeRect(x, y, width, height, false)
  }

  closePath(): void {
    if (this.pathCtx) {
      this.pathCtx.closePath()
    }
    this.stroke()
  }
  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise = false) {
    if (this.pathCtx) {
      this.pathCtx.arc(x, y, radius, startAngle, endAngle, anticlockwise)
    }
  }
  fill(): void {
    this.stroke()
  }
  measureText(data: string, font: string) {
    const ctx = this.getContext()
    ctx.font = font
    return ctx.measureText(data)
  }

  set lineCap(value: CanvasLineCap) {
    this.currentElement.style.strokeLinecap = value
  }

  set lineJoin(value: CanvasLineJoin) {
    this.currentElement.style.strokeLinejoin = value
  }

  scale(x: number, y: number): void {
    const oritransform = this.currentElement.style.transform || ''
    this.currentElement.style.transform = `${oritransform ? `${oritransform} ` : ''}scale(${x}, ${y})`
  }
  rotate(angle: number): void {
    const oritransform = this.currentElement.style.transform || ''
    this.currentElement.style.transform = `${oritransform ? `${oritransform} ` : ''}rotate(${angle}rad)`
  }
  canvas: HTMLCanvasElement | null = null
  getContext(): CanvasRenderingContext2D {
    if (this.ctx) {
      return this.ctx
    }
    const canvas = document.createElement('canvas')
    const ctx = <CanvasRenderingContext2D>canvas.getContext('2d')
    this.canvas = canvas
    this.ctx = ctx
    return ctx
  }
  createPattern(canvas: HTMLCanvasElement): void {
    this.begin('defs')
    this.begin('pattern')
    const pattern = this.currentElement
    const patternWidth = canvas.width
    const patternHeight = canvas.height
    pattern.setAttribute('width', patternWidth.toString())
    pattern.setAttribute('height', patternHeight.toString())
    pattern.setAttribute('patternUnits', 'userSpaceOnUse')
    const patternId = nanoid() // 使用时间戳确保唯一性
    pattern.setAttribute('id', patternId)

    this.begin('image')
    const imageDataUrl = canvas.toDataURL('image/png')
    this.drawImage({ src: imageDataUrl } as HTMLImageElement, 0, 0, patternWidth, patternHeight)
    this.end()

    this.end() // end pattern

    this.end() // end defs

    this.begin('rect')
    this.currentElement.setAttribute('width', '100%')
    this.currentElement.setAttribute('height', '100%')
    this.currentElement.setAttribute('fill', `url(#${patternId})`)
    this.end() // end rect
  }
  html(html: string) {
    this.currentElement.innerHTML = html
  }
  addTempNode(id: string, element: HTMLElement) {
    this.cacheMap.set(id, element)
    // 复制一个临时节点
    const tempNode = document.createElement('div')
    tempNode.dataset.cacheId = id
    this.current.append(tempNode)
  }
}