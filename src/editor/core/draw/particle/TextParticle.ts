import { ElementType, IEditorOption, IElement, RenderMode } from '../../..'
import {
  PUNCTUATION_LIST,
  METRICS_BASIS_TEXT
} from '../../../dataset/constant/Common'
import { DeepRequired } from '../../../interface/Common'
import { IRowElement } from '../../../interface/Row'
import { ITextMetrics } from '../../../interface/Text'
import { AbstractRender } from '../../../render/AbstractRender'
import { Draw } from '../Draw'

export interface IMeasureWordResult {
  width: number
  endElement: IElement | null
}

export class TextParticle {
  private draw: Draw
  private options: DeepRequired<IEditorOption>

  private ctx: AbstractRender
  private curX: number
  private curY: number
  private text: string
  private curElement?: IRowElement | null
  public cacheMeasureText: Map<string, TextMetrics>

  constructor(draw: Draw) {
    this.draw = draw
    this.options = draw.getOptions()
    this.ctx = draw.getPage()
    this.curX = -1
    this.curY = -1
    this.text = ''
    this.curElement = null
    this.cacheMeasureText = new Map()
  }
  // 这里可能是render进来
  public measureBasisWord(
    ctx: CanvasRenderingContext2D,
    font: string
  ): ITextMetrics {
    ctx.save()
    ctx.font = font
    const textMetrics = this.measureText(ctx, {
      value: METRICS_BASIS_TEXT
    })
    ctx.restore()
    return textMetrics
  }
  public measureRenderWord(render: AbstractRender,
    font: string) {
    render.save()
    const ctx = render.getContext()
    ctx.font = font
    const textMetrics = this.measureText(ctx, {
      value: METRICS_BASIS_TEXT
    })
    render.restore()
    return textMetrics
  }

  public measureWord(
    ctx: CanvasRenderingContext2D,
    elementList: IElement[],
    curIndex: number
  ): IMeasureWordResult {
    const LETTER_REG = this.draw.getLetterReg()
    let width = 0
    let endElement: IElement | null = null
    let i = curIndex
    while (i < elementList.length) {
      const element = elementList[i]
      if (
        (element.type && element.type !== ElementType.TEXT) ||
        !LETTER_REG.test(element.value)
      ) {
        endElement = element
        break
      }
      width += this.measureText(ctx, element).width
      i++
    }
    return {
      width,
      endElement
    }
  }

  public measurePunctuationWidth(
    ctx: CanvasRenderingContext2D,
    element: IElement
  ): number {
    if (!element || !PUNCTUATION_LIST.includes(element.value)) return 0
    ctx.font = this.draw.getElementFont(element)
    return this.measureText(ctx, element).width
  }

  public measureText(
    ctx: CanvasRenderingContext2D,
    element: IElement
  ): ITextMetrics {
    // 优先使用自定义字宽设置
    if (element.width) {
      const textMetrics = ctx.measureText(element.value)
      // TextMetrics是类无法解构
      return {
        width: element.width,
        actualBoundingBoxAscent: textMetrics.actualBoundingBoxAscent,
        actualBoundingBoxDescent: textMetrics.actualBoundingBoxDescent,
        actualBoundingBoxLeft: textMetrics.actualBoundingBoxLeft,
        actualBoundingBoxRight: textMetrics.actualBoundingBoxRight,
        fontBoundingBoxAscent: textMetrics.fontBoundingBoxAscent,
        fontBoundingBoxDescent: textMetrics.fontBoundingBoxDescent
      }
    }
    const id = `${element.value}${ctx.font}`
    const cacheTextMetrics = this.cacheMeasureText.get(id)
    if (cacheTextMetrics) {
      return cacheTextMetrics
    }
    const textMetrics = ctx.measureText(element.value)
    this.cacheMeasureText.set(id, textMetrics)
    return textMetrics
  }

  public complete() {
    this._render()
    this.text = ''
  }

  public record(
    ctx: AbstractRender,
    element: IRowElement,
    x: number,
    y: number
  ) {
    this.ctx = ctx
    // 兼容模式立即绘制
    if (this.options.renderMode === RenderMode.COMPATIBILITY) {
      this._setCurXY(x, y)
      this.text = element.value
      this.curElement = element
      this.complete()
      return
    }
    // 主动完成的重设起始点
    if (!this.text) {
      this._setCurXY(x, y)
    }
    // 样式发生改变
    if (
      (this.curElement && element.style !== this.curElement.style) ||
      element.color !== this.curElement?.color
    ) {
      this.complete()
      this._setCurXY(x, y)
    }
    this.text += element.value
    this.curElement = element
  }

  private _setCurXY(x: number, y: number) {
    this.curX = x
    this.curY = y
  }

  private _render() {
    if (!this.text || !~this.curX || !~this.curX || !this.curElement) return
    this.ctx.save('text')
    this.ctx.font = this.curElement.style
    this.ctx.fillStyle = this.curElement.color || this.options.defaultColor
    // 防止空格没有撑开
    this.ctx.current.style.whiteSpace ='break-spaces'
    this.ctx.fillText(this.text, this.curX, this.curY)
    this.ctx.restore()
  }
}
