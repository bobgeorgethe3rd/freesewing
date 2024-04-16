//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { backBase } from './backBase.mjs'
import { frontBase } from './frontBase.mjs'
import { front } from './front.mjs'
import { back } from './back.mjs'
import { sleeveBack } from './sleeveBack.mjs'
import { sleeveFront } from './sleeveFront.mjs'
import { neckbandBack } from './neckbandBack.mjs'
import { neckbandFront } from './neckbandFront.mjs'

// Create new design
const Taliya = new Design({
  data,
  parts: [backBase, frontBase, front, back, sleeveFront, sleeveBack, neckbandBack, neckbandFront],
})

// Named exports
export {
  backBase,
  frontBase,
  front,
  back,
  sleeveBack,
  sleeveFront,
  neckbandBack,
  neckbandFront,
  Taliya,
}
