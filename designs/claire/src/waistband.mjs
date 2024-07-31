import { waistband as claudeWaistband } from '@freesewing/waistbandstraight'
import { legFront } from './legFront.mjs'
// import { placket } from './placket.mjs'

export const waistband = {
  name: 'claire.waistband',
  options: {
    //Imported
    ...claudeWaistband.options,
    //Style
    waistbandOverlapSide: { dflt: 'left', list: ['left', 'right'], menu: 'style' }, //Altered for Claire
  },
  after: [legFront /* placket */],
  plugins: [...claudeWaistband.plugins],
  draft: (sh) => {
    const { macro, points, utils, options, measurements, complete, part } = sh

    if (options.waistbandStyle == 'none') {
      part.hide()
      return part
    } else {
      claudeWaistband.draft(sh)
    }

    return part
  },
}
