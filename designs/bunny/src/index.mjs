//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { sharedFront } from './sharedFront.mjs'
import { front } from './front.mjs'
import { back } from './back.mjs'
import { placket } from './placket.mjs'
import { frontFacing } from './frontFacing.mjs'
import { backFacing } from './backFacing.mjs'

// Create new design
const Bunny = new Design({
  data,
  parts: [sharedFront, front, back, placket, frontFacing, backFacing],
})

// Named exports
export { sharedFront, front, back, placket, frontFacing, backFacing, Bunny }
