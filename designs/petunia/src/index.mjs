//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { frontBase } from './frontBase.mjs'
import { backBase } from './backBase.mjs'

// Create new design
const Petunia = new Design({
  data,
  parts: [frontBase, backBase],
})

// Named exports
export { frontBase, backBase, Petunia }
