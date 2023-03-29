//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { waistband } from './waistband.mjs'

// Create new design
const Waistbandstraight = new Design({
  data,
  parts: [waistband],
})

// Named exports
export { waistband, Waistbandstraight }
