//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { crown } from './crown.mjs'
import { brim } from './brim.mjs'
import { lining } from './lining.mjs'

// Create new design
const Merlin = new Design({
  data,
  parts: [crown, brim, lining],
})

// Named exports
export { crown, brim, lining, Merlin }
