import { waistband as waistbandStraight } from '@freesewing/waistbandstraight'
import { waistband as waistbandCurved } from '@freesewing/waistbandcurved'
import { frontBase } from './frontBase.mjs'

const waistbandDraft = (params) => {
  switch (params.options.waistbandStyle) {
    case 'straight':
      return waistbandStraight(params)
    case 'curved':
      return waistbandCurved(params)
    default:
      return waistbandStraight(params)
  }
}

export const waistband = {
  name: 'jackson.waistband',
  after: frontBase,
  options: {
    //Style
    waistbandStyle: { dflt: 'straight', list: ['straight', 'curved'], menu: 'style' },
  },
  draft: waistbandDraft,
}
