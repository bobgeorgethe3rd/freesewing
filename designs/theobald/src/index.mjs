//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { backBase } from './backBase.mjs'
import { frontBase } from './frontBase.mjs'
import { back } from './back.mjs'

// Create new design
const Theobald = new Design({
  data,
  parts: [backBase, frontBase, back],
})

// Named exports
export { backBase, frontBase, back, Theobald }
