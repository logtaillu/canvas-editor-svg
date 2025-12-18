import { IHtmlOptions } from '../../interface/Html'

export const defaultHtmlOptions: Readonly<Required<IHtmlOptions>> = {
  create: () => document.createElement('div')
}
