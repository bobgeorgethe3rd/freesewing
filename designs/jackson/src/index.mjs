//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { backBase } from './backBase.mjs'
import { back } from './back.mjs'
import { backPocket } from './backPocket.mjs'
import { yokeBack } from './yokeBack.mjs'
import { frontBase } from './frontBase.mjs'
import { front } from './front.mjs'
import { frontPocketFacing } from './frontPocketFacing.mjs'
import { frontPocketFacingB } from './frontPocketFacingB.mjs'
import { coinPocket } from './coinPocket.mjs'
import { frontPocketBag } from './frontPocketBag.mjs'
import { fly } from './fly.mjs'
import { buttonholePlacket } from './buttonholePlacket.mjs'
import { flyShield } from './flyShield.mjs'
import { beltLoops } from './beltLoops.mjs'
import { waistband } from './waistband.mjs'
import { leatherPatch } from './leatherPatch.mjs'

// Create new design
const Jackson = new Design({
  data,
  parts: [
    backBase,
    back,
    backPocket,
    yokeBack,
    frontBase,
    front,
    frontPocketFacing,
    frontPocketFacingB,
    coinPocket,
    frontPocketBag,
    fly,
    buttonholePlacket,
    flyShield,
    beltLoops,
    waistband,
    leatherPatch,
  ],
})

// Named exports
export {
  backBase,
  back,
  backPocket,
  yokeBack,
  frontBase,
  front,
  frontPocketFacing,
  frontPocketFacingB,
  coinPocket,
  frontPocketBag,
  fly,
  buttonholePlacket,
  flyShield,
  beltLoops,
  waistband,
  leatherPatch,
  Jackson,
}
