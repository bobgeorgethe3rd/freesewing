//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { front } from './front.mjs'
import { back } from './back.mjs'
import { frontPocketBag } from './frontPocketBag.mjs'
import { frontPocketFacing } from './frontPocketFacing.mjs'

// Create new design
const Paul = new Design({
  data,
  parts: [front, back, frontPocketBag, frontPocketFacing],
})

// Named exports
export { front, back, frontPocketBag, frontPocketFacing, Paul }
