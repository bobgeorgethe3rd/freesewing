//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { sharedFront } from './sharedFront.mjs'
import { front } from './front.mjs'
import { back } from './back.mjs'
import { placket } from './placket.mjs'

// Create new design
const Bunny = new Design({
  data,
  parts: [sharedFront, front, back, placket],
})

// Named exports
export { sharedFront, front, back, placket, Bunny }
