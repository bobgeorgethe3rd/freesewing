//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { frontBase } from './frontBase.mjs'
import { backBase } from './backBase.mjs'
import { front } from './front.mjs'
import { back } from './back.mjs'
import { sleeveFront } from './sleeveFront.mjs'
import { sleeveBack } from './sleeveBack.mjs'
import { neckbandBack } from './neckbandBack.mjs'
import { neckbandFront } from './neckbandFront.mjs'

// Create new design
const Taliya = new Design({
  data,
  parts: [frontBase, backBase, front, back, sleeveFront, sleeveBack, neckbandBack, neckbandFront],
})

// Named exports
export {
  frontBase,
  backBase,
  front,
  back,
  sleeveFront,
  sleeveBack,
  neckbandBack,
  neckbandFront,
  Taliya,
}
