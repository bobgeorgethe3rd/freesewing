//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { sleevecap } from './sleevecap.mjs'

// Create new design
const Sleevecap = new Design({
  data,
  parts: [sleevecap],
})

// Named exports
export { sleevecap, Sleevecap }
