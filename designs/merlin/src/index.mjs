//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { crown } from './crown.mjs'
import { brim } from './brim.mjs'

// Create new design
const Merlin = new Design({
  data,
  parts: [crown, brim],
})

// Named exports
export { crown, brim, Merlin }
