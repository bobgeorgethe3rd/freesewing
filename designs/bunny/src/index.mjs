//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { sharedFront } from './sharedFront.mjs'
import { front } from './front.mjs'

// Create new design
const Bunny = new Design({
  data,
  parts: [sharedFront, front],
})

// Named exports
export { sharedFront, front, Bunny }
