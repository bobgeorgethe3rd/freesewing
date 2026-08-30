//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { frontBase } from './frontBase.mjs'
import { backBase } from './backBase.mjs'
import { sleeveBase } from './sleeveBase.mjs'
import { yokeFront } from './yokeFront.mjs'
import { centreFront } from './centreFront.mjs'
import { frontPanel } from './frontPanel.mjs'
import { sideFront } from './sideFront.mjs'
import { frontFacing } from './frontFacing.mjs'
import { weltPocketBag } from './weltPocketBag.mjs'

// Create new design
const Denny = new Design({
  data,
  parts: [
    frontBase,
    backBase,
    yokeFront,
    centreFront,
    frontPanel,
    sideFront,
    frontFacing,
    sleeveBase,
    weltPocketBag,
  ],
})

// Named exports
export {
  frontBase,
  backBase,
  yokeFront,
  centreFront,
  frontPanel,
  sideFront,
  frontFacing,
  sleeveBase,
  weltPocketBag,
  Denny,
}
