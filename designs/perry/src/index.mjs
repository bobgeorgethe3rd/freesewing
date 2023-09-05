//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { crown } from './crown.mjs'
import { band } from './band.mjs'
import { peak } from './peak.mjs'

// Create new design
const Perry = new Design({
  data,
  parts: [crown, band, peak],
})

// Named exports
export { crown, band, peak, Perry }
