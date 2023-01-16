//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { front } from './front.mjs'

// Create new design
const Daisy = new Design({
  data,
  parts: [front],
})

// Named exports
export { front, Daisy }
