//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { crownSide } from './crownSide.mjs'

// Create new design
const Billy = new Design({
  data,
  parts: [crownSide],
})

// Named exports
export { crownSide, Billy }
