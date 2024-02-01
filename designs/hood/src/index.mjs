//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { hood } from './hood.mjs'

// Create new design
const Hood = new Design({
  data,
  parts: [hood],
})

// Named exports
export { hood, Hood }
