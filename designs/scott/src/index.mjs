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
import { sleeve } from './sleeve.mjs'
import { sleeveBand } from './sleeveBand.mjs'
import { skirtFront } from './skirtFront.mjs'

// Create new design
const Scott = new Design({
  data,
  parts: [frontBase, backBase, front, sideFront, back, sideBack, sleeve, sleeveBand, skirtFront],
})

// Named exports
export {
  frontBase,
  backBase,
  front,
  sideFront,
  back,
  sideBack,
  sleeve,
  sleeveBand,
  skirtFront,
  Scott,
}
