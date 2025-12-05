import { mathjax } from 'mathjax-full/js/mathjax.js'
import { TeX } from 'mathjax-full/js/input/tex.js'
import { SVG } from 'mathjax-full/js/output/svg.js'
import { AllPackages } from 'mathjax-full/js/input/tex/AllPackages.js'
import { HTMLHandler } from 'mathjax-full/js/handlers/html/HTMLHandler.js'
import { liteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor.js'
import { mathjaxSvgCache } from '../../../../../dataset/constant/Mathjax'

const adaptor = liteAdaptor()

// 2. 注册文档处理器 (与之前相同)
const htmlHandler = new HTMLHandler(adaptor)
mathjax.handlers.register(htmlHandler)

// 3. 配置 MathJax (与之前相同)
const texInput = new TeX({
  packages: AllPackages
})

const svgOutput = new SVG({
  fontCache: 'local'
})

const doc = mathjax.document('', {
  InputJax: texInput,
  OutputJax: svgOutput
})
function roundNum (num: number, pow: number) {
  const p = Math.pow(10, pow)
  return Math.round(num * p) / p
}
function ex2px (str: string, reg: RegExp, baseFont = 16) {
  const val = str.match(reg)
  const num = val ? parseFloat(val[1]) : 0
  return roundNum(num * baseFont / 1.89, 4)
}
export const MathJaxBaseFont = 16
export function renderLatexToSvg(latex: string) {
  const block = latex.startsWith('$$')
  latex = latex.replace(/^\$+/, '').replace(/\$+$/, '')
  const cacheKey = `${latex}`
  // 缓存读取
  if (mathjaxSvgCache.has(cacheKey)) {
    return mathjaxSvgCache.get(cacheKey)
  }
  // svg转换
  let svgNode
  const convertLatex = (tex: string) => {
    return doc.convert(tex, {
      // display: block, // 块级公式
      em: MathJaxBaseFont, // 基准字体大小(px)
      ex: MathJaxBaseFont / 2 // x-height(px)
    })
  }
  try {
    svgNode = convertLatex(latex)
  } catch (e) {
    try {
      const content = latex.replace(/([\u0080-\uFFFF]+)/g, '\\text{$1}')
      svgNode = convertLatex(content)
    } catch (e) {
      // 兜底
      svgNode = convertLatex('&')
    }
  }
  const svgString = adaptor.innerHTML(svgNode)
  const w = ex2px(svgString, /width="([.\d]+)/, MathJaxBaseFont)
  const h = ex2px(svgString, /height="([.\d]+)/, MathJaxBaseFont)
  const align = ex2px(svgString, /vertical-align\s*:\s*([-.\d]+)/, MathJaxBaseFont)
  // svgString = svgString.replace(/width="[.\d]+ex"/, `width="${w}"`)
  // svgString = svgString.replace(/height="[.\d]+ex"/, `height="${h}"`)
  return {
    svg: svgString,
    width: w,
    height: h,
    align: align,
    block
  }
}