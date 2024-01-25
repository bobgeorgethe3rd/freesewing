//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { frontBase } from './frontBase.mjs'
import { backBase } from './backBase.mjs'
import { centreFront } from './centreFront.mjs'
import { sideFront } from './sideFront.mjs'
import { frontTop } from './frontTop.mjs'
import { back } from './back.mjs'
import { sideBack } from './sideBack.mjs'
import { pocket } from './pocket.mjs'
import { sleeve } from './sleeve.mjs'
import { sleeveFlounce } from './sleeveFlounce.mjs'
import { sleeveChannel } from './sleeveChannel.mjs'
import { sleeveTie } from './sleeveTie.mjs'
import { sleeveBand } from './sleeveBand.mjs'

// Create new design
const Petunia = new Design({
  data,
  parts: [
    frontBase,
    backBase,
    centreFront,
    sideFront,
    frontTop,
    back,
    sideBack,
    pocket,
    sleeve,
    sleeveFlounce,
    sleeveChannel,
    sleeveTie,
    sleeveBand,
  ],
})

// Named exports
export {
  frontBase,
  backBase,
  centreFront,
  sideFront,
  frontTop,
  back,
  sideBack,
  pocket,
  sleeve,
  sleeveFlounce,
  sleeveChannel,
  sleeveTie,
  sleeveBand,
  Petunia,
}
