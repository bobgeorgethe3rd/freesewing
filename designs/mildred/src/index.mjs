//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { crown } from './crown.mjs'
import { brimBase } from './brimBase.mjs'
import { brim } from './brim.mjs'

// Create new design
const Mildred = new Design({
  data,
  parts: [crown, brimBase, brim],
})

// Named exports
export { crown, brimBase, brim, Mildred }
