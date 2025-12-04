import { getUUID, pickObject, splitText, deepClone } from '.'
import { LaTexParticle } from '../core/draw/particle/latex/LaTexParticle'
import { MathjaxParticle } from '../core/draw/particle/mathjax/MathjaxParticle'
import { ZERO } from '../dataset/constant/Common'
import { EDITOR_ELEMENT_CONTEXT_ATTR, EDITOR_ROW_ATTR, CONTROL_STYLE_ATTR, TEXTLIKE_ELEMENT_TYPE } from '../dataset/constant/Element'
import { START_LINE_BREAK_REG } from '../dataset/constant/Regular'
import { titleSizeMapping } from '../dataset/constant/Title'
import { ControlComponent, ControlType } from '../dataset/enum/Control'
import { ElementType } from '../dataset/enum/Element'
import { RowFlex } from '../dataset/enum/Row'
import { DeepRequired } from '../interface/Common'
import { IEditorOption } from '../interface/Editor'
import { IElement } from '../interface/Element'
import { isTextLikeElement, unzipElementList } from './element'
interface IFormatElementListOption {
  isHandleFirstElement?: boolean // 根据上下文确定首字符处理逻辑（处理首字符补偿）
  isForceCompensation?: boolean // 强制补偿字符
  editorOptions: DeepRequired<IEditorOption>
}
export function formatElementList(
  elementList: IElement[],
  options: IFormatElementListOption
) {
  const {
    isHandleFirstElement = true,
    isForceCompensation = false,
    editorOptions
  } = options
  const startElement = elementList[0]
  // 非首字符零宽节点文本元素则补偿-列表元素内部会补偿此处忽略
  if (
    isForceCompensation ||
    (isHandleFirstElement &&
      startElement?.type !== ElementType.LIST &&
      ((startElement?.type && startElement.type !== ElementType.TEXT) ||
        !START_LINE_BREAK_REG.test(startElement?.value)))
  ) {
    elementList.unshift({
      value: ZERO
    })
  }
  let i = 0
  while (i < elementList.length) {
    let el = elementList[i]
    // 优先处理虚拟元素
    if (el.type === ElementType.TITLE) {
      // 移除父节点
      elementList.splice(i, 1)
      // 格式化元素
      const valueList = el.valueList || []
      formatElementList(valueList, {
        ...options,
        isHandleFirstElement: false,
        isForceCompensation: false
      })
      // 追加节点
      if (valueList.length) {
        const titleId = el.titleId || getUUID()
        const titleOptions = editorOptions.title
        for (let v = 0; v < valueList.length; v++) {
          const value = valueList[v]
          value.title = el.title
          if (el.level) {
            value.titleId = titleId
            value.level = el.level
          }
          // 文本型元素设置字体及加粗
          if (isTextLikeElement(value)) {
            if (!value.size) {
              value.size = titleOptions[titleSizeMapping[value.level!]]
            }
            if (value.bold === undefined) {
              value.bold = true
            }
          }
          elementList.splice(i, 0, value)
          i++
        }
      }
      i--
    } else if (el.type === ElementType.LIST) {
      // 移除父节点
      elementList.splice(i, 1)
      // 格式化元素
      const valueList = el.valueList || []
      formatElementList(valueList, {
        ...options,
        isHandleFirstElement: true,
        isForceCompensation: false
      })
      // 追加节点
      if (valueList.length) {
        const listId = getUUID()
        for (let v = 0; v < valueList.length; v++) {
          const value = valueList[v]
          value.listId = listId
          value.listType = el.listType
          value.listStyle = el.listStyle
          elementList.splice(i, 0, value)
          i++
        }
      }
      i--
    } else if (el.type === ElementType.AREA) {
      // 移除父节点
      elementList.splice(i, 1)
      // 格式化元素
      const valueList = el?.valueList || []
      formatElementList(valueList, {
        ...options,
        isHandleFirstElement: true,
        isForceCompensation: true
      })
      if (valueList.length) {
        const areaId = getUUID()
        for (let v = 0; v < valueList.length; v++) {
          const value = valueList[v]
          value.areaId = el.areaId || areaId
          value.area = el.area
          value.areaIndex = v
          if (value.type === ElementType.TABLE) {
            const trList = value.trList!
            for (let r = 0; r < trList.length; r++) {
              const tr = trList[r]
              for (let d = 0; d < tr.tdList.length; d++) {
                const td = tr.tdList[d]
                const tdValueList = td.value
                for (let t = 0; t < tdValueList.length; t++) {
                  const tdValue = tdValueList[t]
                  tdValue.areaId = el.areaId || areaId
                  tdValue.area = el.area
                }
              }
            }
          }
          elementList.splice(i, 0, value)
          i++
        }
      }
      i--
    } else if (el.type === ElementType.TABLE) {
      const tableId = el.id || getUUID()
      el.id = tableId
      if (el.trList) {
        const { defaultTrMinHeight } = editorOptions.table
        for (let t = 0; t < el.trList.length; t++) {
          const tr = el.trList[t]
          const trId = tr.id || getUUID()
          tr.id = trId
          if (!tr.minHeight || tr.minHeight < defaultTrMinHeight) {
            tr.minHeight = defaultTrMinHeight
          }
          if (tr.height < tr.minHeight) {
            tr.height = tr.minHeight
          }
          for (let d = 0; d < tr.tdList.length; d++) {
            const td = tr.tdList[d]
            const tdId = td.id || getUUID()
            td.id = tdId
            formatElementList(td.value, {
              ...options,
              isHandleFirstElement: true,
              isForceCompensation: true
            })
            // 首字符字体大小默认使用首个字符元素字体大小
            if (
              !td.value[0].size &&
              td.value[1]?.size &&
              isTextLikeElement(td.value[1])
            ) {
              td.value[0].size = td.value[1].size
            }
            for (let v = 0; v < td.value.length; v++) {
              const value = td.value[v]
              value.tdId = tdId
              value.trId = trId
              value.tableId = tableId
            }
          }
        }
      }
    } else if (el.type === ElementType.HYPERLINK) {
      // 移除父节点
      elementList.splice(i, 1)
      // 元素展开
      const valueList = unzipElementList(el.valueList || [])
      // 追加节点
      if (valueList.length) {
        const hyperlinkId = getUUID()
        for (let v = 0; v < valueList.length; v++) {
          const value = valueList[v]
          value.type = el.type
          value.url = el.url
          value.hyperlinkId = hyperlinkId
          elementList.splice(i, 0, value)
          i++
        }
      }
      i--
    } else if (el.type === ElementType.DATE) {
      // 移除父节点
      elementList.splice(i, 1)
      // 元素展开
      const valueList = unzipElementList(el.valueList || [])
      // 追加节点
      if (valueList.length) {
        const dateId = getUUID()
        for (let v = 0; v < valueList.length; v++) {
          const value = valueList[v]
          value.type = el.type
          value.dateFormat = el.dateFormat
          value.dateId = dateId
          elementList.splice(i, 0, value)
          i++
        }
      }
      i--
    } else if (el.type === ElementType.CONTROL) {
      // 兼容控件内容类型错误
      if (!el.control) {
        i++
        continue
      }
      const {
        prefix,
        postfix,
        preText,
        postText,
        value,
        placeholder,
        code,
        type,
        valueSets
      } = el.control
      const {
        editorOptions: {
          control: controlOption,
          checkbox: checkboxOption,
          radio: radioOption
        }
      } = options
      const controlId = el.controlId || getUUID()
      // 移除父节点
      elementList.splice(i, 1)
      // 控件上下文提取（压缩后的控件上下文无法提取）
      const controlContext = pickObject(el, [
        ...EDITOR_ELEMENT_CONTEXT_ATTR,
        ...EDITOR_ROW_ATTR
      ])
      // 控件设置的默认样式（以前缀为基准）
      const controlDefaultStyle = pickObject(
        <IElement>(<unknown>el.control),
        CONTROL_STYLE_ATTR
      )
      // 前后缀个性化设置
      const thePrePostfixArg: Omit<IElement, 'value'> = {
        ...controlDefaultStyle,
        color: editorOptions.control.bracketColor
      }
      // 前缀
      const prefixStrList = splitText(prefix || controlOption.prefix)
      for (let p = 0; p < prefixStrList.length; p++) {
        const value = prefixStrList[p]
        elementList.splice(i, 0, {
          ...controlContext,
          ...thePrePostfixArg,
          controlId,
          value,
          type: el.type,
          control: el.control,
          controlComponent: ControlComponent.PREFIX
        })
        i++
      }
      // 前文本
      if (preText) {
        const preTextStrList = splitText(preText)
        for (let p = 0; p < preTextStrList.length; p++) {
          const value = preTextStrList[p]
          elementList.splice(i, 0, {
            ...controlContext,
            ...controlDefaultStyle,
            controlId,
            value,
            type: el.type,
            control: el.control,
            controlComponent: ControlComponent.PRE_TEXT
          })
          i++
        }
      }
      // 值
      if (
        (value && value.length) ||
        type === ControlType.CHECKBOX ||
        type === ControlType.RADIO ||
        (type === ControlType.SELECT && code && (!value || !value.length))
      ) {
        let valueList: IElement[] = value ? deepClone(value) : []
        if (type === ControlType.CHECKBOX) {
          const codeList = code ? code.split(',') : []
          if (Array.isArray(valueSets) && valueSets.length) {
            // 拆分valueList优先使用其属性
            const valueStyleList = valueList.reduce(
              (pre, cur) =>
                pre.concat(
                  cur.value.split('').map(v => ({ ...cur, value: v }))
                ),
              [] as IElement[]
            )
            let valueStyleIndex = 0
            for (let v = 0; v < valueSets.length; v++) {
              const valueSet = valueSets[v]
              // checkbox组件
              elementList.splice(i, 0, {
                ...controlContext,
                ...controlDefaultStyle,
                controlId,
                value: '',
                type: el.type,
                control: el.control,
                controlComponent: ControlComponent.CHECKBOX,
                checkbox: {
                  code: valueSet.code,
                  value: codeList.includes(valueSet.code)
                }
              })
              i++
              // 文本
              const valueStrList = splitText(valueSet.value)
              for (let e = 0; e < valueStrList.length; e++) {
                const value = valueStrList[e]
                const isLastLetter = e === valueStrList.length - 1
                elementList.splice(i, 0, {
                  ...controlContext,
                  ...controlDefaultStyle,
                  ...valueStyleList[valueStyleIndex],
                  controlId,
                  value: value === '\n' ? ZERO : value,
                  letterSpacing: isLastLetter ? checkboxOption.gap : 0,
                  control: el.control,
                  controlComponent: ControlComponent.VALUE
                })
                valueStyleIndex++
                i++
              }
            }
          }
        } else if (type === ControlType.RADIO) {
          if (Array.isArray(valueSets) && valueSets.length) {
            // 拆分valueList优先使用其属性
            const valueStyleList = valueList.reduce(
              (pre, cur) =>
                pre.concat(
                  cur.value.split('').map(v => ({ ...cur, value: v }))
                ),
              [] as IElement[]
            )
            let valueStyleIndex = 0
            for (let v = 0; v < valueSets.length; v++) {
              const valueSet = valueSets[v]
              // radio组件
              elementList.splice(i, 0, {
                ...controlContext,
                ...controlDefaultStyle,
                controlId,
                value: '',
                type: el.type,
                control: el.control,
                controlComponent: ControlComponent.RADIO,
                radio: {
                  code: valueSet.code,
                  value: code === valueSet.code
                }
              })
              i++
              // 文本
              const valueStrList = splitText(valueSet.value)
              for (let e = 0; e < valueStrList.length; e++) {
                const value = valueStrList[e]
                const isLastLetter = e === valueStrList.length - 1
                elementList.splice(i, 0, {
                  ...controlContext,
                  ...controlDefaultStyle,
                  ...valueStyleList[valueStyleIndex],
                  controlId,
                  value: value === '\n' ? ZERO : value,
                  letterSpacing: isLastLetter ? radioOption.gap : 0,
                  control: el.control,
                  controlComponent: ControlComponent.VALUE
                })
                valueStyleIndex++
                i++
              }
            }
          }
        } else {
          if (!value || !value.length) {
            if (Array.isArray(valueSets) && valueSets.length) {
              const valueSet = valueSets.find(v => v.code === code)
              if (valueSet) {
                valueList = [
                  {
                    value: valueSet.value
                  }
                ]
              }
            }
          }
          formatElementList(valueList, {
            ...options,
            isHandleFirstElement: false,
            isForceCompensation: false
          })
          for (let v = 0; v < valueList.length; v++) {
            const element = valueList[v]
            const value = element.value
            elementList.splice(i, 0, {
              ...controlContext,
              ...controlDefaultStyle,
              ...element,
              controlId,
              value: value === '\n' ? ZERO : value,
              type: element.type || ElementType.TEXT,
              control: el.control,
              controlComponent: ControlComponent.VALUE
            })
            i++
          }
        }
      } else if (placeholder) {
        // placeholder
        const thePlaceholderArgs: Omit<IElement, 'value'> = {
          ...controlDefaultStyle,
          color: editorOptions.control.placeholderColor
        }
        const placeholderStrList = splitText(placeholder)
        for (let p = 0; p < placeholderStrList.length; p++) {
          const value = placeholderStrList[p]
          elementList.splice(i, 0, {
            ...controlContext,
            ...thePlaceholderArgs,
            controlId,
            value: value === '\n' ? ZERO : value,
            type: el.type,
            control: el.control,
            controlComponent: ControlComponent.PLACEHOLDER
          })
          i++
        }
      }
      // 后文本
      if (postText) {
        const postTextStrList = splitText(postText)
        for (let p = 0; p < postTextStrList.length; p++) {
          const value = postTextStrList[p]
          elementList.splice(i, 0, {
            ...controlContext,
            ...controlDefaultStyle,
            controlId,
            value,
            type: el.type,
            control: el.control,
            controlComponent: ControlComponent.POST_TEXT
          })
          i++
        }
      }
      // 后缀
      const postfixStrList = splitText(postfix || controlOption.postfix)
      for (let p = 0; p < postfixStrList.length; p++) {
        const value = postfixStrList[p]
        elementList.splice(i, 0, {
          ...controlContext,
          ...thePrePostfixArg,
          controlId,
          value,
          type: el.type,
          control: el.control,
          controlComponent: ControlComponent.POSTFIX
        })
        i++
      }
      i--
    } else if (
      (!el.type || TEXTLIKE_ELEMENT_TYPE.includes(el.type)) &&
      el.value?.length > 1
    ) {
      elementList.splice(i, 1)
      const valueList = splitText(el.value)
      for (let v = 0; v < valueList.length; v++) {
        elementList.splice(i + v, 0, { ...el, value: valueList[v] })
      }
      el = elementList[i]
    }
    if (el.value === '\n' || el.value == '\r\n') {
      el.value = ZERO
    }
    if (el.type === ElementType.IMAGE || el.type === ElementType.BLOCK) {
      el.id = el.id || getUUID()
    }
    if (el.type === ElementType.LATEX) {
      const { svg, width, height } = LaTexParticle.convertLaTextToSVG(el.value)
      el.width = el.width || width
      el.height = el.height || height
      el.laTexSVG = svg
      el.id = el.id || getUUID()
    } else if (el.type === ElementType.MATHJAX) {
      const { svg, width, height, block } = MathjaxParticle.convertLaTextToSVG(el.value)
      el.width = el.width || width
      el.height = el.height || height
      el.laTexSVG = svg
      el.isBlock = block
      if (block) {
        el.rowFlex = RowFlex.CENTER
      }
      el.id = el.id || getUUID()
    } else if (el.type === ElementType.HTML) {
      el.id = el.id || getUUID()
    }
    i++
  }
}