//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { crown } from './crown.mjs'

// Create new design
const Barkley = new Design({
  data,
  parts: [crown],
})

// Named exports
export { crown, Barkley }
