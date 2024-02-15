//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { back } from './back.mjs'
import { front } from './front.mjs'
import { backBase } from './backBase.mjs'
import { frontBase } from './frontBase.mjs'

// Create new design
const Dalton = new Design({
  data,
  parts: [backBase, frontBase],
})

// Named exports
export { back, front, backBase, frontBase, Dalton }
