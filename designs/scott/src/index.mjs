//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { frontBase } from './frontBase.mjs'
import { backBase } from './backBase.mjs'
import { front } from './front.mjs'
import { sideFront } from './sideFront.mjs'
import { back } from './back.mjs'
import { sideBack } from './sideBack.mjs'
import { sleeveBase } from './sleeveBase.mjs'
import { sleeve } from './sleeve.mjs'
import { sleeveBand } from './sleeveBand.mjs'
import { skirtBase } from './skirtBase.mjs'
import { skirtFront } from './skirtFront.mjs'
import { skirtBack } from './skirtBack.mjs'
import { pocket } from './pocket.mjs'
import { placket } from './placket.mjs'
import { skirtPlacket } from './skirtPlacket.mjs'
import { waistband } from './waistband.mjs'
import { bodiceFrontFacing } from './bodiceFrontFacing.mjs'
import { bodiceBackFacing } from './bodiceBackFacing.mjs'

// Create new design
const Scott = new Design({
  data,
  parts: [
    frontBase,
    backBase,
    front,
    sideFront,
    back,
    sideBack,
    sleeveBase,
    sleeve,
    sleeveBand,
    skirtBase,
    skirtFront,
    skirtBack,
    pocket,
    placket,
    skirtPlacket,
    bodiceFrontFacing,
    bodiceBackFacing,
    waistband,
  ],
})

// Named exports
export {
  frontBase,
  backBase,
  front,
  sideFront,
  back,
  sideBack,
  sleeveBase,
  sleeve,
  sleeveBand,
  skirtBase,
  skirtFront,
  skirtBack,
  pocket,
  placket,
  skirtPlacket,
  bodiceFrontFacing,
  bodiceBackFacing,
  waistband,
  Scott,
}
