//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { back } from './back.mjs'
import { frontBase } from './frontBase.mjs'
import { front } from './front.mjs'

// Create new design
const Caleb = new Design({
  data,
  parts: [back, frontBase, front],
})

// Named exports
export { back, frontBase, front, Caleb }
