//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { box } from './box.mjs'

// Create new design
const Watchpocket = new Design({
  data,
  parts: [box],
})

// Named exports
export { box, Watchpocket }
