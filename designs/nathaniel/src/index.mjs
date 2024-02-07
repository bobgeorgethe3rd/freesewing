//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { crown } from './crown.mjs'
import { band } from './band.mjs'
import { visor } from './visor.mjs'

// Create new design
const Nathaniel = new Design({
  data,
  parts: [crown, band, visor],
})

// Named exports
export { crown, band, visor, Nathaniel }
