//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { backBase } from './backBase.mjs'
import { back } from './back.mjs'
import { sideBack } from './sideBack.mjs'
import { front } from './front.mjs'
import { sideFront } from './sideFront.mjs'
import { frontFacing } from './frontFacing.mjs'
import { backFacing } from './backFacing.mjs'
//Export Only
import { frontBaseShoulder } from './frontBaseShoulder.mjs'
import { frontBaseBustShoulder } from './frontBaseBustShoulder.mjs'
import { frontShoulder } from './frontShoulder.mjs'
import { frontBustShoulder } from './frontBustShoulder.mjs'
import { sideFrontShoulder } from './sideFrontShoulder.mjs'
import { sideFrontBustShoulder } from './sideFrontBustShoulder.mjs'
import { frontFacingShoulder } from './frontFacingShoulder.mjs'

// Create new design
const Sammie = new Design({
  data,
  parts: [backBase, back, sideBack, front, sideFront, frontFacing, backFacing],
})

// Named exports
export {
  backBase,
  back,
  sideBack,
  front,
  sideFront,
  frontFacing,
  backFacing,
  //Export Only
  // frontBaseShoulder,
  // frontBaseBustShoulder,
  // frontShoulder,
  // frontBustShoulder,
  // sideFrontShoulder,
  // sideFrontBustShoulder,
  // frontFacingShoulder,
  Sammie,
}
