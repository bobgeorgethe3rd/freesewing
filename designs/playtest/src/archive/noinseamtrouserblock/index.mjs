//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { leg } from './leg.mjs'

// Create new design
const Playtest = new Design({
  data,
  parts: [leg],
})

// Named exports
export { leg, Playtest }
