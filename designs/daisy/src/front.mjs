import { back } from './back.mjs'
import { frontBase } from './frontBase.mjs'
import { frontWaistDart } from './frontWaistDart.mjs'
// import { frontWaistSplitDart } from './frontWaistSplitDart.mjs'
import { front2WaistDart } from './front2WaistDart.mjs'
import { frontFrenchDart } from './frontFrenchDart.mjs'
import { frontSideDart } from './frontSideDart.mjs'
import { frontBustSideDart } from './frontBustSideDart.mjs'
// import { frontSideSplitDart } from './frontSideSplitDart.mjs'
// import { front2SideDart } from './front2SideDart.mjs'
import { frontUnderarmDart } from './frontUnderarmDart.mjs'
import { frontArmholeDart } from './frontArmholeDart.mjs'
import { frontArmholePitchDart } from './frontArmholePitchDart.mjs'
import { frontShoulderDart } from './frontShoulderDart.mjs'
import { frontBustShoulderDart } from './frontBustShoulderDart.mjs'
// import { front2ShoulderDart } from './front2ShoulderDart.mjs'
// import { frontNeckDart } from './frontNeckDart.mjs'
// import { frontCfDart } from './frontCfDart.mjs'

const daisyFront = (params) => {
  switch (params.options.bustDartPlacement) {
    case 'waist':
      return frontWaistDart(params)
    // case 'waistSplit':
    // return frontWaistSplitDart(params)
    case '2waist':
      return front2WaistDart(params)
    case 'french':
      return frontFrenchDart(params)
    case 'side':
      return frontSideDart(params)
    // case 'sideSplit':
    // return frontSideSplitDart(params)
    // case '2side':
    // return front2SideDart(params)
    case 'underarm':
      return frontUnderarmDart(params)
    case 'armhole':
      return frontArmholeDart(params)
    case 'armholePitch':
      return frontArmholePitchDart(params)
    case 'shoulder':
      return frontShoulderDart(params)
    case 'bustshoulder':
      return frontBustShoulderDart(params)
    // case '2shoulder':
    // return front2ShoulderDart(params)
    // case 'neck':
    // return frontNeckDart(params)
    // case 'centreFront':
    // return frontCfDart(params)
    default:
      return frontBustSideDart(params)
  }
}

export const front = {
  name: 'daisy.front',
  from: frontBase,
  after: back,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Constants
    cfSaWidth: 0,
    //Darts
    bustDartPlacement: {
      dflt: 'bustside',
      list: [
        'waist',
        // 'waistSplit',
        '2waist',
        'french',
        'side',
        'bustside',
        // 'sideSplit',
        // '2side',
        'underarm',
        'armhole',
        'armholePitch',
        'shoulder',
        'bustshoulder',
        // '2shoulder',
        // 'neck',
        // 'centreFront',
      ],
      menu: 'darts',
    },
    // bustDartCurve: { pct: 100, min: -100, max: 100, menu: 'darts' },
    bustDartLength: { pct: 70, min: 60, max: 100, menu: 'darts' },
    waistDartLength: { pct: 70, min: 60, max: 100, menu: 'darts' },
    bustDartFraction: { pct: 50, min: 0, max: 100, menu: 'darts' },
  },
  draft: daisyFront,
}
