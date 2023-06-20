import { frontShared } from './frontShared.mjs'
import { frontWaistDart } from './frontWaistDart.mjs'
import { frontSideDart } from './frontSideDart.mjs'
import { frontUnderarmDart } from './frontUnderarmDart.mjs'
import { frontArmholeDart } from './frontArmholeDart.mjs'
import { frontShoulderDart } from './frontShoulderDart.mjs'
import { frontCfDart } from './frontCfDart.mjs'

const daisyFront = (params) => {
  switch (params.options.bustDartPlacement) {
    case 'waist':
      return frontWaistDart(params)
    case 'underarm':
      return frontUnderarmDart(params)
    case 'armhole':
      return frontArmholeDart(params)
    case 'shoulder':
      return frontShoulderDart(params)
    case 'centreFront':
      return frontCfDart(params)
    default:
      return frontSideDart(params)
  }
}

export const front = {
  name: 'daisy.front',
  from: frontShared,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    bustDartPlacement: {
      dflt: 'side',
      list: ['waist', 'side', 'underarm', 'armhole', 'shoulder', 'centreFront'],
      menu: 'darts',
    },
    bustDartCurve: { pct: 100, min: -100, max: 100, menu: 'darts' },
    bustDartFraction: { pct: 50, min: 0, max: 100, menu: 'darts' },
    parallelShoulder: { bool: false, menu: 'darts' },
  },
  draft: daisyFront,
}
