//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { back } from './back.mjs'
import { frontBase } from './frontBase.mjs'
import { front } from './front.mjs'
import { backPocketBag } from './backPocketBag.mjs'
import { backPocketWelt } from './backPocketWelt.mjs'
import { backPocketTab } from './backPocketTab.mjs'
import { backPocketPatch } from './backPocketPatch.mjs'
import { frontPocketBag } from './frontPocketBag.mjs'
import { frontPocketBagB } from './frontPocketBagB.mjs'
import { frontPocketFacing } from './frontPocketFacing.mjs'
import { frontPocketFacingB } from './frontPocketFacingB.mjs'
import { fly } from './fly.mjs'
import { buttonholePlacket } from './buttonholePlacket.mjs'
import { flyShield } from './flyShield.mjs'
import { waistband } from './waistband.mjs'
import { beltLoops } from './beltLoops.mjs'
import { legBand } from './legBand.mjs'

// Create new design
const Callum = new Design({
  data,
  parts: [
    back,
    frontBase,
    front,
    backPocketBag,
    backPocketWelt,
    backPocketTab,
    backPocketPatch,
    frontPocketBag,
    frontPocketBagB,
    frontPocketFacing,
    frontPocketFacingB,
    fly,
    buttonholePlacket,
    flyShield,
    waistband,
    beltLoops,
    legBand,
  ],
})

// Named exports
export {
  back,
  frontBase,
  front,
  backPocketBag,
  backPocketWelt,
  backPocketTab,
  backPocketPatch,
  frontPocketBag,
  frontPocketBagB,
  frontPocketFacing,
  frontPocketFacingB,
  fly,
  buttonholePlacket,
  flyShield,
  waistband,
  beltLoops,
  legBand,
  Callum,
}
