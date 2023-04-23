//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { backBase } from './backBase.mjs'

// Create new design
const Theobald = new Design({
  data,
  parts: [backBase],
})

// Named exports
export { backBase, Theobald }
