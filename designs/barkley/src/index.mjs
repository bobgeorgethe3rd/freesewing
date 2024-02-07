//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { crown } from './crown.mjs'
import { visor } from './visor.mjs'

// Create new design
const Barkley = new Design({
  data,
  parts: [crown, visor],
})

// Named exports
export { crown, visor, Barkley }
