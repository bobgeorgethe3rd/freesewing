import sidePanelA from './sidePanelA'
import sidePanelFull from './sidePanelFull'

export default (part) => {
  let { options } = part.shorthand()
  switch (options.sideDart) {
    case 'seam':
      return sidePanelA(part)
    case 'dart':
      return sidePanelFull(part)
	  }
}