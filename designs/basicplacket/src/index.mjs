//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { placket } from './placket.mjs'

// Create new design
const Basicplacket = new Design({
  data,
  parts: [placket],
})

// Named exports
export { placket, Basicplacket }
