//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { sharedBase } from './sharedBase.mjs'

// Create new design
const Byron = new Design({
  data,
  parts: [sharedBase],
})

// Named exports
export { sharedBase, Byron }
