//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { back } from './back.mjs'
import { backPocket } from './backPocket.mjs'
import { front } from './front.mjs'
import { frontPocketBag } from './frontPocketBag.mjs'
import { frontPocketFacing } from './frontPocketFacing.mjs'
import { frontPocketFacingB } from './frontPocketFacingB.mjs'
import { coinPocket } from './coinPocket.mjs'

//Imported parts

import { yokeBack } from '@freesewing/jackson'
import { fly } from '@freesewing/jackson'
import { buttonholePlacket } from '@freesewing/jackson'
import { flyShield } from '@freesewing/jackson'
import { beltLoops } from '@freesewing/jackson'
import { waistband } from '@freesewing/jackson'
import { leatherPatch } from '@freesewing/jackson'

// Create new design
const Jack = new Design({
  data,
  parts: [
    back,
    backPocket,
    yokeBack,
    front,
    frontPocketFacing,
    frontPocketFacingB,
    coinPocket,
    frontPocketBag,
    fly,
    buttonholePlacket,
    flyShield,
    beltLoops,
    waistband,
    leatherPatch,
  ],
})

// Named exports
export {
  back,
  backPocket,
  yokeBack,
  front,
  frontPocketFacing,
  frontPocketFacingB,
  coinPocket,
  frontPocketBag,
  fly,
  buttonholePlacket,
  flyShield,
  beltLoops,
  waistband,
  leatherPatch,
  Jack,
}
