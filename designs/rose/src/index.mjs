//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { front } from './front.mjs'
import { sideFront } from './sideFront.mjs'
import { back } from './back.mjs'
import { sideBack } from './sideBack.mjs'
import { sleeveBase } from './sleeveBase.mjs'
import { sleeve } from './sleeve.mjs'
import { pocket } from './pocket.mjs'
import { skirtFront } from './skirtFront.mjs'
import { skirtBack } from './skirtBack.mjs'
import { waistband } from './waistband.mjs'
import { frontFacing } from './frontFacing.mjs'
import { backFacing } from './backFacing.mjs'

// Create new design
const Rose = new Design({
  data,
  parts: [
    front,
    sideFront,
    back,
    sideBack,
    sleeveBase,
    sleeve,
    pocket,
    skirtFront,
    skirtBack,
    waistband,
    frontFacing,
    backFacing,
  ],
})

// Named exports
export {
  front,
  sideFront,
  back,
  sideBack,
  sleeveBase,
  sleeve,
  pocket,
  skirtFront,
  skirtBack,
  waistband,
  frontFacing,
  backFacing,
  Rose,
}
