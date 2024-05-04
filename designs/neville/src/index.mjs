//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { draftCross } from './draftCross.mjs'

// Create new design
const Neville = new Design({
  data,
  parts: [draftCross],
})

// Named exports
export { draftCross, Neville }
