//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { beltLoops } from './beltLoops.mjs'

// Create new design
const Beltloops = new Design({
  data,
  parts: [beltLoops],
})

// Named exports
export { beltLoops, Beltloops }
