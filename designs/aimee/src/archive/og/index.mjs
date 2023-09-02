//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { frontBase } from './frontBase.mjs'
import { back } from './back.mjs'
import { front } from './front.mjs'

// Create new design
const Aimee = new Design({
  data,
  parts: [frontBase, back, front],
})

// Named exports
export { frontBase, back, front, Aimee }
