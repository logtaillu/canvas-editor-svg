import { IEditorOption } from '../../../interface/Editor'
import { IElement } from '../../../interface/Element'
import { AbstractRender } from '../../../render/AbstractRender'
import { Draw } from '../Draw'

export class HtmlParticle {
  protected options: Required<IEditorOption>
  constructor(draw: Draw) {
    this.options = draw.getOptions()
  }
  public render(
      ctx: AbstractRender,
      element: IElement,
      x: number,
      y: number
    ) {
    ctx.save('foreignObject')
    ctx.current.style.transformOrigin = `${x}px ${y}px`
    ctx.scale(this.options.scale, this.options.scale)
    ctx.current.id = element.id!
    ctx.fillRect(x, y, element.width!, element.height!)
    ctx.html(element.value)
    ctx.restore()
  }
}