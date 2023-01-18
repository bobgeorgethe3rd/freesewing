//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { frontBase } from './frontBase.mjs'
import { backBase } from './backBase.mjs'
import { front } from './front.mjs'
import { sideFront } from './sideFront.mjs'

// Create new design
const Peach = new Design({
  data,
  parts: [frontBase, backBase, front, sideFront],
})

// Named exports
export { frontBase, backBase, front, sideFront, Peach }
