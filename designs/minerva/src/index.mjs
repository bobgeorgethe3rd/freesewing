//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { crown } from './crown.mjs'
import { brim } from './brim.mjs'
import { earFlap } from './earFlap.mjs'
import { band } from './band.mjs'

// Create new design
const Minerva = new Design({
  data,
  parts: [crown, brim, earFlap, band],
})

// Named exports
export { crown, brim, earFlap, band, Minerva }
