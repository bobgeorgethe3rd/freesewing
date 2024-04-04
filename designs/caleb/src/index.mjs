//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { back } from './back.mjs'
import { backPocket } from './backPocket.mjs'
import { frontBase } from './frontBase.mjs'
import { front } from './front.mjs'
import { frontPocketBag } from './frontPocketBag.mjs'
import { frontPocketFacing } from './frontPocketFacing.mjs'
import { frontPocketFacingB } from './frontPocketFacingB.mjs'
import { fly } from './fly.mjs'
import { buttonholePlacket } from './buttonholePlacket.mjs'
import { flyShield } from './flyShield.mjs'
import { sidePocket } from './sidePocket.mjs'
import { sidePocketFlap } from './sidePocketFlap.mjs'

// Create new design
const Caleb = new Design({
  data,
  parts: [
    back,
    backPocket,
    frontBase,
    front,
    frontPocketBag,
    frontPocketFacing,
    frontPocketFacingB,
    fly,
    buttonholePlacket,
    flyShield,
    sidePocket,
    sidePocketFlap,
  ],
})

// Named exports
export {
  back,
  backPocket,
  frontBase,
  front,
  frontPocketBag,
  frontPocketFacing,
  frontPocketFacingB,
  fly,
  buttonholePlacket,
  flyShield,
  sidePocket,
  sidePocketFlap,
  Caleb,
}
