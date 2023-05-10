//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { crownTop } from './crownTop.mjs'
import { crownSide } from './crownSide.mjs'
import { brim } from './brim.mjs'

// Create new design
const Billy = new Design({
  data,
  parts: [crownTop, crownSide, brim],
})

// Named exports
export { crownTop, crownSide, brim, Billy }
