//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { backBase } from './backBase.mjs'
import { frontBase } from './frontBase.mjs'
import { back } from './back.mjs'
import { yokeBack } from './yokeBack.mjs'
import { frontPocketFacing } from './frontPocketFacing.mjs'
import { coinPocket } from './coinPocket.mjs'
import { frontPocketBag } from './frontPocketBag.mjs'
import { front } from './front.mjs'
import { fly } from './fly.mjs'

// Create new design
const Jackson = new Design({
  data,
  parts: [
    backBase,
    frontBase,
    back,
    yokeBack,
    frontPocketFacing,
    coinPocket,
    frontPocketBag,
    front,
    fly,
  ],
})

// Named exports
export {
  backBase,
  frontBase,
  back,
  yokeBack,
  frontPocketFacing,
  coinPocket,
  frontPocketBag,
  front,
  fly,
  Jackson,
}
