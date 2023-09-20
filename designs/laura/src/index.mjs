//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { leg8 } from './leg8.mjs'
import { waistband } from './waistband.mjs'

// Create new design
const Laura = new Design({
  data,
  parts: [leg8, waistband],
})

// Named exports
export { leg8, waistband, Laura }
