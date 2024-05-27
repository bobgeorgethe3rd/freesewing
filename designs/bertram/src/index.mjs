//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { leg } from './leg.mjs'

// Create new design
const Bertram = new Design({
  data,
  parts: [leg],
})

// Named exports
export { leg, Bertram }
