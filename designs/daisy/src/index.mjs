//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { back } from './back.mjs'
import { front } from './front.mjs'
import { frontBase } from './frontBase.mjs'
import { backBase } from './backBase.mjs'

// Create new design
const Daisy = new Design({
  data,
  parts: [/* back, front, */ frontBase, backBase],
})

// Named exports
export { back, front, frontBase, backBase, Daisy }
