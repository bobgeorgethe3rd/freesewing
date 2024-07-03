//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { leg } from './leg.mjs'
import { crotchGusset } from './crotchGusset.mjs'
import { seatGusset } from './seatGusset.mjs'
import { waistband } from './waistband.mjs'

// Create new design
const Heleanor = new Design({
  data,
  parts: [leg, crotchGusset, seatGusset, waistband],
})

// Named exports
export { leg, crotchGusset, seatGusset, waistband, Heleanor }
