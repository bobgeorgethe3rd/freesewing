//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { skirtFront } from './skirtFront.mjs'

// Create new design
const Harvey = new Design({
  data,
  parts: [skirtFront],
})

// Named exports
export { skirtFront, Harvey }
