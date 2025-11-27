import { IRowElement } from '../../../interface/Row'
import { AbstractRender } from '../../../render/AbstractRender'

export class SubscriptParticle {
  // 向下偏移字高的一半
  public getOffsetY(element: IRowElement): number {
    return element.metrics.height / 2
  }

  public render(
    ctx: AbstractRender,
    element: IRowElement,
    x: number,
    y: number
  ) {
    ctx.save('text')
    ctx.font = element.style
    if (element.color) {
      ctx.fillStyle = element.color
    }
    ctx.fillText(element.value, x, y + this.getOffsetY(element))
    ctx.restore()
  }
}
