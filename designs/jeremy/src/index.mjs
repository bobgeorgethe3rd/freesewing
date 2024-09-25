//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { sharedBase } from './sharedBase.mjs'

// Create new design
const Jeremy = new Design({
  data,
  parts: [sharedBase],
})

// Named exports
export { sharedBase, Jeremy }
