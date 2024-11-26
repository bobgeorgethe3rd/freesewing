//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { front } from './front.mjs'
import { back } from './back.mjs'
import { backPocket } from './backPocket.mjs'
import { frontPocketBag } from './frontPocketBag.mjs'
import { legBand } from './legBand.mjs'

// Create new design
const Sawyer = new Design({
  data,
  parts: [front, back, backPocket, frontPocketBag, legBand],
})

// Named exports
export { front, back, backPocket, frontPocketBag, legBand, Sawyer }
