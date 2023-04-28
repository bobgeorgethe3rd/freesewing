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
  Theobald,
}
