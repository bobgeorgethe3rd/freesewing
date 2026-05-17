//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { crown } from './crown.mjs'
import { crownSide } from './crownSide.mjs'
import { brim } from './brim.mjs'

// Create new design
const Playtest = new Design({
  data,
  parts: [crown, crownSide, brim],
})

// Named exports
export { crown, crownSide, brim, Playtest }
