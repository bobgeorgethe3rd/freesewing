import { pctBasedOn } from '@freesewing/core'
import { pluginLogoRG } from '@freesewing/plugin-logorg'
import { brimBase } from './brimBase.mjs'
import { brimCircle } from './brimCircle.mjs'
import { brimEye } from './brimEye.mjs'
import { brimGeometric } from './brimGeometric.mjs'
import { brimOval } from './brimOval.mjs'

const mildredBrim = (params) => {
  switch (params.options.brimStyle) {
    case 'eye':
      return brimEye(params)
    case 'geometric':
      return brimGeometric(params)
    case 'oval':
      return brimOval(params)
    default:
      return brimCircle(params)
  }
}

export const brim = {
  name: 'mildred.brim',
  from: brimBase,
  hide: {
    from: true,
  },
  plugins: [pluginLogoRG],
  options: {
    //Style
    brimStyle: { dflt: 'circle', list: ['circle', 'eye', 'geometric', 'oval'], menu: 'style' },
    brimWidth: { pct: 8.2, min: 5, max: 50, snap: 5, ...pctBasedOn('head'), menu: 'style' },
    brimSideOffset: { pct: 2.25, min: 1, max: 5, menu: 'style' },
    brimSideNum: { count: 8, min: 3, max: 12, menu: 'style' },
  },
  draft: mildredBrim,
}
