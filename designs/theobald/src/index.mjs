//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { backBase } from './backBase.mjs'
import { frontBase } from './frontBase.mjs'
import { back } from './back.mjs'
import { front } from './front.mjs'
import { backPocketBag } from './backPocketBag.mjs'
import { backPocketWelt } from './backPocketWelt.mjs'
import { backPocketTab } from './backPocketTab.mjs'
import { frontPocketBag } from './frontPocketBag.mjs'
import { frontPocketBagB } from './frontPocketBagB.mjs'
import { frontPocketFacing } from './frontPocketFacing.mjs'
import { frontPocketFacingB } from './frontPocketFacingB.mjs'
import { fly } from './fly.mjs'
import { flyShield } from './flyShield.mjs'
import { waistbandLeft } from './waistbandLeft.mjs'
import { waistbandRight } from './waistbandRight.mjs'
// import { waistbandStraightLeft } from './waistbandStraightLeft.mjs'
// import { waistbandStraightRight } from './waistbandStraightRight.mjs'
// import { waistbandCurvedLeft } from './waistbandCurvedLeft.mjs'
// import { waistbandCurvedRight } from './waistbandCurvedRight.mjs'
import { waistbandFishtailLeft } from './waistbandFishtailLeft.mjs'
import { waistbandFishtailRight } from './waistbandFishtailRight.mjs'
import { beltLoops } from './beltLoops.mjs'

// Create new design
const Theobald = new Design({
  data,
  parts: [
    backBase,
    frontBase,
    back,
    front,
    backPocketBag,
    backPocketWelt,
    backPocketTab,
    frontPocketBag,
    frontPocketBagB,
    frontPocketFacing,
    frontPocketFacingB,
    fly,
    flyShield,
    waistbandLeft,
    waistbandRight,
    // waistbandStraightLeft,
    // waistbandStraightRight,
    // waistbandCurvedLeft,
    // waistbandCurvedRight,
    waistbandFishtailLeft,
    waistbandFishtailRight,
    beltLoops,
  ],
})

// Named exports
export {
  backBase,
  frontBase,
  back,
  front,
  backPocketBag,
  backPocketWelt,
  backPocketTab,
  frontPocketBag,
  frontPocketBagB,
  frontPocketFacing,
  frontPocketFacingB,
  fly,
  flyShield,
  waistbandLeft,
  waistbandRight,
  // waistbandStraightLeft,
  // waistbandStraightRight,
  // waistbandCurvedLeft,
  // waistbandCurvedRight,
  waistbandFishtailLeft,
  waistbandFishtailRight,
  beltLoops,
  Theobald,
}
