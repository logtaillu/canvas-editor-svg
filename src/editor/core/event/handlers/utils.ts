// 调整鼠标事件的offset,因为foreignObject内部元素的相对起点不同
export function adjustMouseOffset(evt: MouseEvent) {
  const container = (evt.target as HTMLElement)?.closest('[data-index]')
  if (!container) {
    return evt
  }
  const outerRect = container.getBoundingClientRect()
  const relativeX = evt.clientX - outerRect.left
  const relativeY = evt.clientY - outerRect.top
  return {
    offsetX: Math.round(relativeX),
    offsetY: Math.round(relativeY)
  }
}