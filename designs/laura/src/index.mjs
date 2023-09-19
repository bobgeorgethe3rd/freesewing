//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { leg8 } from './leg8.mjs'

// Create new design
const Laura = new Design({
  data,
  parts: [leg8],
})

// Named exports
export { leg8, Laura }
