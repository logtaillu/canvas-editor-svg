import { IElement } from '../../interface/Element'
import { debounce } from '../../utils'
import { Draw } from '../draw/Draw'

export class HtmlResizeObserver {
  private observer: ResizeObserver | null = null
  private elements: IElement[] = []
  private draw: Draw
  constructor(draw: Draw) {
    this.draw = draw
  }

  private updateRender = debounce(() => {
    this.draw.render({
      isSubmitHistory: false
    })
  }, 50)

  public observe(elements: IElement[]) {
    this.elements = []
    this.observer?.disconnect()
    window.requestAnimationFrame(()=>{
      const observer = new ResizeObserver((entries) => {
        let changed = false
        for (const entry of entries) {
          const element = entry.target as HTMLElement
          const targetElement = this.elements.find(el => el.id === element.parentElement?.id)
          if (targetElement && targetElement.height !== element.clientHeight) {
            targetElement.height = element.clientHeight
            changed = true
          }
        }
        if (changed) {
          this.updateRender()
        }
      })
      elements.forEach(element => {
        const el = document.getElementById(element.id!)?.firstElementChild
        if (el) {
          this.elements.push(element)
          observer.observe(el)
        }
      })
        this.observer = observer
    })
  }
}