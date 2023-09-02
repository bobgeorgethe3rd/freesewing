//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { front } from './front.mjs'
import { back } from './back.mjs'
import { frontFacing } from './frontFacing.mjs'
import { backFacing } from './backFacing.mjs'
import { strap } from './strap.mjs'

// Create new design
const Camden = new Design({
  data,
  parts: [front, back, frontFacing, backFacing, strap],
})

// Named exports
export { front, back, frontFacing, backFacing, strap, Camden }
