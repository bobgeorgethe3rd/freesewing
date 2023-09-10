//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { crown } from './crown.mjs'
import { brim } from './brim.mjs'
import { earFlap } from './earFlap.mjs'

// Create new design
const Minerva = new Design({
  data,
  parts: [crown, brim, earFlap],
})

// Named exports
export { crown, brim, earFlap, Minerva }
