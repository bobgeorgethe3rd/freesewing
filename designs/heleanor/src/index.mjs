//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { leg } from './leg.mjs'

// Create new design
const Heleanor = new Design({
  data,
  parts: [leg],
})

// Named exports
export { leg, Heleanor }
