//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { back } from './back.mjs'
import { frontBase } from './frontBase.mjs'
import { frontLeft } from './frontLeft.mjs'
import { frontRight } from './frontRight.mjs'
import { frontFacing } from './frontFacing.mjs'
import { frontFacingB } from './frontFacingB.mjs'
import { liningPocket } from './liningPocket.mjs'
import { sleeve } from './sleeve.mjs'
import { sleevePlacket } from './sleevePlacket.mjs'
import { sleeveCuff } from './sleeveCuff.mjs'
import { collarBand } from './collarBand.mjs'
import { collar } from './collar.mjs'

// Create new design
const Playtest = new Design({
  data,
  parts: [
    back,
    frontBase,
    frontLeft,
    frontRight,
    frontFacing,
    frontFacingB,
    liningPocket,
    sleeve,
    sleevePlacket,
    sleeveCuff,
    collarBand,
    collar,
  ],
})

// Named exports
export {
  back,
  frontBase,
  frontLeft,
  frontRight,
  frontFacing,
  frontFacingB,
  liningPocket,
  sleeve,
  sleevePlacket,
  sleeveCuff,
  collarBand,
  collar,
  Playtest,
}
