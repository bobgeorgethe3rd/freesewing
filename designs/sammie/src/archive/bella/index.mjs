//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { backBase } from './backBase.mjs'
import { frontBase } from './frontBase.mjs'
import { centreBack } from './centreBack.mjs'
import { sideBack } from './sideBack.mjs'
import { sideFront } from './sideFront.mjs'
import { centreFront } from './centreFront.mjs'
import { backFacing } from './backFacing.mjs'
import { frontFacing } from './frontFacing.mjs'

// Create new design
const Sammie = new Design({
  data,
  parts: [
    backBase,
    frontBase,
    centreBack,
    sideBack,
    sideFront,
    backFacing,
    frontFacing,
    centreFront,
  ],
})

// Named exports
export {
  backBase,
  frontBase,
  centreBack,
  sideBack,
  sideFront,
  centreFront,
  backFacing,
  frontFacing,
  Sammie,
}
