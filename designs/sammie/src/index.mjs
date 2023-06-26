//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { backBase } from './backBase.mjs'
import { frontBase } from './frontBase.mjs'

// Create new design
const Sammie = new Design({
  data,
  parts: [backBase, frontBase],
})

// Named exports
export { backBase, frontBase, Sammie }
