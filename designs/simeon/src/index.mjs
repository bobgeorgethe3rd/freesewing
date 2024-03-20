//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { front } from './front.mjs'
import { back } from './back.mjs'
import { frontPocketBag } from './frontPocketBag.mjs'
import { frontPocketFacing } from './frontPocketFacing.mjs'
import { waistband } from './waistband.mjs'
import { beltLoops } from './beltLoops.mjs'

// Create new design
const Simeon = new Design({
  data,
  parts: [front, back, frontPocketBag, frontPocketFacing, waistband, beltLoops],
})

// Named exports
export { front, back, frontPocketBag, frontPocketFacing, waistband, beltLoops, Simeon }
