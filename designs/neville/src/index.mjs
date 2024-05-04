//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { draftCross } from './draftCross.mjs'
import { leg } from './leg.mjs'

// Create new design
const Neville = new Design({
  data,
  parts: [draftCross, leg],
})

// Named exports
export { draftCross, leg, Neville }
