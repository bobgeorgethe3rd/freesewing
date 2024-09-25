//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { sharedBase } from './sharedBase.mjs'
import { back } from './back.mjs'

// Create new design
const Jeremy = new Design({
  data,
  parts: [sharedBase, back],
})

// Named exports
export { sharedBase, back, Jeremy }
