//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { sharedFront } from './sharedFront.mjs'
import { front } from './front.mjs'
import { back } from './back.mjs'
import { frontFacing } from './frontFacing.mjs'
import { backFacing } from './backFacing.mjs'
import { strap } from './strap.mjs'

// Create new design
const Camden = new Design({
  data,
  parts: [sharedFront, front, back, frontFacing, backFacing, strap],
})

// Named exports
export { sharedFront, front, back, frontFacing, backFacing, strap, Camden }
