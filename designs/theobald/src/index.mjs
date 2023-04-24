//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { backBase } from './backBase.mjs'
import { frontBase } from './frontBase.mjs'
import { back } from './back.mjs'
import { front } from './front.mjs'

// Create new design
const Theobald = new Design({
  data,
  parts: [backBase, frontBase, back, front],
})

// Named exports
export { backBase, frontBase, back, front, Theobald }
