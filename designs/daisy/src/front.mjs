import { frontShared } from './frontShared.mjs'
import { draftFrontWaistDart } from './frontWaistDart.mjs'
import { draftFrontSideDart } from './frontSideDart.mjs'
import { draftFrontUnderarmDart } from './frontUnderarmDart.mjs'
import { draftFrontArmholeDart } from './frontArmholeDart.mjs'
import { draftFrontShoulderDart } from './frontShoulderDart.mjs'
import { draftFrontCfDart } from './frontCfDart.mjs'

const daisyFront = (params) => {
  switch (params.options.bustDartPlacement) {
    case 'waist':
      return draftFrontWaistDart(params)
    case 'underarm':
      return draftFrontUnderarmDart(params)
    case 'armhole':
      return draftFrontArmholeDart(params)
    case 'shoulder':
      return draftFrontShoulderDart(params)
    case 'centreFront':
      return draftFrontCfDart(params)
    default:
      return draftFrontSideDart(params)
  }
}

export const front = {
  name: 'daisy.front',
  from: frontShared,
  hideDependencies: true,
  options: {
    bustDartPlacement: {
      dflt: 'side',
      list: ['waist', 'side', 'underarm', 'armhole', 'shoulder', 'centreFront'],
      menu: 'darts',
    },
    bustDartCurve: { pct: 100, min: -100, max: 100, menu: 'darts' },
    bustDartFraction: { pct: 50, min: 0, max: 100, menu: 'darts' },
  },
  draft: daisyFront,
}
