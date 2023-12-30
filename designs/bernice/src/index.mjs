//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { front } from './front.mjs'

// Create new design
const Bernice = new Design({
  data,
  parts: [front],
})

// Named exports
export { front, Bernice }
