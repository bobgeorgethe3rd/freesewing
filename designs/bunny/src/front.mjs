import { sharedFront } from './sharedFront.mjs'
import { frontFrenchDart } from './frontFrenchDart.mjs'
import { frontSideDart } from './frontSideDart.mjs'
import { frontBustSideDart } from './frontBustSideDart.mjs'
import { frontUnderarmDart } from './frontUnderarmDart.mjs'
// import { armhole } from './frontArmholeDart.mjs'
// import { armholePitch } from './frontArmholePitchDart.mjs'

const bunnyFront = (params) => {
  switch (params.options.bustDartPlacement) {
    case 'french':
      return frontFrenchDart(params)
    case 'side':
      return frontSideDart(params)
    case 'underarm':
      return frontUnderarmDart(params)
    case 'armhole':
      return frontArmholeDart(params)
    case 'armholePitch':
      return frontArmholePitchDart(params)
    case 'shoulder':
      return frontShoulderDart(params)
    default:
      return frontBustSideDart(params)
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
      dflt: 'bustside',
      list: ['french', 'side', 'bustside', 'underarm', 'armhole', 'armholePitch', 'shoulder'],
      menu: 'darts',
    },
    bustDartLength: { pct: 70, min: 60, max: 100, menu: 'darts' },
    bustDartFraction: { pct: 50, min: 0, max: 100, menu: 'darts' },
    //Construction
    cfSaWidth: { pct: 0, min: 0, max: 3, menu: 'construction' },
    necklineSaWidth: { pct: 0, min: 0, max: 2.5, menu: 'construction' },
    sideSeamSaWidth: { pct: 1, min: 1, max: 3, menu: 'construction' },
    hemWidth: { pct: 2, min: 0, max: 3, menu: 'construction' },
  },
  draft: bunnyFront,
}
