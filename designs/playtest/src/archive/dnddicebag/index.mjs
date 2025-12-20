//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { box } from './box.mjs'
import { facing } from './facing.mjs'

// Create new design
const Playtest = new Design({
  data,
  parts: [box, facing],
})

// Named exports
export { box, facing, Playtest }
