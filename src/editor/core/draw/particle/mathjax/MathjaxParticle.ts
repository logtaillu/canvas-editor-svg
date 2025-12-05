import { IEditorOption } from '../../../../interface/Editor'
import { IElement } from '../../../../interface/Element'
import { AbstractRender } from '../../../../render/AbstractRender'
import { Draw } from '../../Draw'
import { MathJaxBaseFont, renderLatexToSvg } from '../mathjax/utils/MathjaxUtil'

export class MathjaxParticle {
  protected options: Required<IEditorOption>
  protected draw: Draw
  constructor(draw: Draw) {
    this.draw = draw
    this.options = draw.getOptions()
  }
  public static convertLaTextToSVG(laTex: string) {
    return renderLatexToSvg(laTex)
  }

  public render(
    ctx: AbstractRender,
    element: IElement,
    x: number,
    y: number
  ) {
    const { scale, defaultSize } = this.options
    ctx.save('g')
    const { svg, align, height } = renderLatexToSvg(element.value)

    const actureScale = scale * (element.size || defaultSize)! / MathJaxBaseFont
    ctx.translate(x, y - height * actureScale - align * actureScale)
    ctx.scale(actureScale, actureScale)
    ctx.html(svg)
    // 蒙层覆盖展示光标
    ctx.save('rect')
    ctx.globalAlpha = 0
    ctx.current.style.cursor = 'pointer'
    ctx.fillRect(0, 0, element.width!, element.height!)
    ctx.restore()
    ctx.restore()
  }
}
