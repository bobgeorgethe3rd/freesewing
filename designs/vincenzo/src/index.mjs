//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { back } from './back.mjs'

// Create new design
const Vincenzo = new Design({
  data,
  parts: [back],
})

// Named exports
export { back, Vincenzo }
