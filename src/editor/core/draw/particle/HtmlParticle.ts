import { EditorZone } from '../../../dataset/enum/Editor'
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
      y: number,
      zone = EditorZone.MAIN,
      pageNo = 1
  ) {
    ctx.save('foreignObject')
    ctx.current.style.transformOrigin = `${x}px ${y}px`
    ctx.scale(this.options.scale, this.options.scale)
    // 页眉页脚拼接页码信息
    const id = zone === EditorZone.MAIN ? element.id! : `${pageNo}_${element.id}`
    // 这个id还是用原始id
    ctx.current.id = element.id!
    ctx.fillRect(x, y, element.width!, element.height!)
    if (element.element) {
      ctx.addTempNode(id, element.element)
    } else if (element.component) {
      const el = this.options.html.create?.(id, element.value, element.props)
      if (el) {
        ctx.addTempNode(id, el)
      }
    } else {
      ctx.html(element.value)
    }
    ctx.restore()
  }
}