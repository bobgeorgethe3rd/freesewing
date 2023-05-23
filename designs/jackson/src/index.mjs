//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { backBase } from './backBase.mjs'
import { frontBase } from './frontBase.mjs'
import { back } from './back.mjs'
import { yokeBack } from './yokeBack.mjs'
import { backPocket } from './backPocket.mjs'
import { frontPocketFacing } from './frontPocketFacing.mjs'
import { coinPocket } from './coinPocket.mjs'
import { frontPocketBag } from './frontPocketBag.mjs'
import { front } from './front.mjs'
import { fly } from './fly.mjs'
import { buttonholePlacket } from './buttonholePlacket.mjs'
import { flyShield } from './flyShield.mjs'
import { beltLoops } from './beltLoops.mjs'
import { waistband } from './waistband.mjs'
// import { waistbandStraight } from './waistbandStraight.mjs'
// import { waistbandCurved } from './waistbandCurved.mjs'
import { leatherPatch } from './leatherPatch.mjs'

// Create new design
const Jackson = new Design({
  data,
  parts: [
    backBase,
    frontBase,
    back,
    yokeBack,
    backPocket,
    frontPocketFacing,
    coinPocket,
    frontPocketBag,
    front,
    fly,
    buttonholePlacket,
    flyShield,
    beltLoops,
    waistband,
    // waistbandStraight,
    // waistbandCurved,
    leatherPatch,
  ],
})

// Named exports
export {
  backBase,
  frontBase,
  back,
  yokeBack,
  backPocket,
  frontPocketFacing,
  coinPocket,
  frontPocketBag,
  front,
  fly,
  buttonholePlacket,
  flyShield,
  beltLoops,
  waistband,
  // waistbandStraight,
  // waistbandCurved,
  leatherPatch,
  Jackson,
}
