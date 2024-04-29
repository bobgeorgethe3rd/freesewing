import { pluginBundle } from '@freesewing/plugin-bundle'
import { pluginLogoRG } from '@freesewing/plugin-logorg'
import { sharedFront } from './sharedFront.mjs'
import { frontFrenchDart } from './frontFrenchDart.mjs'
import { frontSideDart } from './frontSideDart.mjs'
import { frontBustSideDart } from './frontBustSideDart.mjs'
import { frontUnderarmDart } from './frontUnderarmDart.mjs'
import { frontArmholeDart } from './frontArmholeDart.mjs'
import { frontArmholePitchDart } from './frontArmholePitchDart.mjs'
import { frontShoulderDart } from './frontShoulderDart.mjs'

const bunnyFront = (params) => {
  switch (params.options.bustDartPlacement) {
    case 'side':
      return frontSideDart(params)
    case 'bustside':
      return frontBustSideDart(params)
    case 'underarm':
      return frontUnderarmDart(params)
    case 'armhole':
      return frontArmholeDart(params)
    case 'armholePitch':
      return frontArmholePitchDart(params)
    case 'shoulder':
      return frontShoulderDart(params)
    default:
      return frontFrenchDart(params)
  }
}

export const front = {
  name: 'bunny.front',
  from: sharedFront,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Fit
    daisyGuide: { bool: false, menu: 'fit' },
    //Darts
    bustDartPlacement: {
      dflt: 'french',
      list: ['french', 'side', 'bustside', 'underarm', 'armhole', 'armholePitch', 'shoulder'],
      menu: 'darts',
    },
    bustDartLength: { pct: 70, min: 60, max: 100, menu: 'darts' },
    bustDartFraction: { pct: 50, min: 0, max: 100, menu: 'darts' },
    //Construction
    cfSaWidth: { pct: 0, min: 0, max: 3, menu: 'construction' },
    armholeSaWidth: { pct: 0, min: 0, max: 3, menu: 'construction' },
    necklineSaWidth: { pct: 0, min: 0, max: 2.5, menu: 'construction' },
    sideSeamSaWidth: { pct: 1, min: 1, max: 3, menu: 'construction' },
    hemWidth: { pct: 2, min: 0, max: 3, menu: 'construction' },
  },
  plugins: [pluginBundle, pluginLogoRG],
  draft: bunnyFront,
}
