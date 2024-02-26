//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { backBase } from './backBase.mjs'
import { back } from './back.mjs'
import { backPocketBag } from './backPocketBag.mjs'
import { backPocketWelt } from './backPocketWelt.mjs'
import { backPocketTab } from './backPocketTab.mjs'
import { frontBase } from './frontBase.mjs'
import { front } from './front.mjs'
import { frontPocketBag } from './frontPocketBag.mjs'
import { frontPocketBagB } from './frontPocketBagB.mjs'
import { frontPocketFacing } from './frontPocketFacing.mjs'
import { frontPocketFacingB } from './frontPocketFacingB.mjs'
import { fly } from './fly.mjs'
import { buttonholePlacket } from './buttonholePlacket.mjs'
import { flyShield } from './flyShield.mjs'
import { waistbandLeft } from './waistbandLeft.mjs'
import { waistbandRight } from './waistbandRight.mjs'
import { waistbandFishtailLeft } from './waistbandFishtailLeft.mjs'
import { waistbandFishtailRight } from './waistbandFishtailRight.mjs'
import { beltLoops } from './beltLoops.mjs'

// Create new design
const Theobald = new Design({
  data,
  parts: [
    backBase,
    back,
    backPocketBag,
    backPocketWelt,
    backPocketTab,
    frontBase,
    front,
    frontPocketBag,
    frontPocketBagB,
    frontPocketFacing,
    frontPocketFacingB,
    fly,
    buttonholePlacket,
    flyShield,
    waistbandLeft,
    waistbandRight,
    waistbandFishtailLeft,
    waistbandFishtailRight,
    beltLoops,
  ],
})

// Named exports
export {
  backBase,
  back,
  backPocketBag,
  backPocketWelt,
  backPocketTab,
  frontBase,
  front,
  frontPocketBag,
  frontPocketBagB,
  frontPocketFacing,
  frontPocketFacingB,
  fly,
  buttonholePlacket,
  flyShield,
  waistbandLeft,
  waistbandRight,
  waistbandFishtailLeft,
  waistbandFishtailRight,
  beltLoops,
  Theobald,
}
