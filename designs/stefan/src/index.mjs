//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { body } from './body.mjs'

// Create new design
const Stefan = new Design({
  data,
  parts: [body],
})

// Named exports
export { body, Stefan }
