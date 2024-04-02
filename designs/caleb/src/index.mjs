//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { back } from './back.mjs'
import { backPocket } from './backPocket.mjs'
import { frontBase } from './frontBase.mjs'
import { front } from './front.mjs'

// Create new design
const Caleb = new Design({
  data,
  parts: [back, backPocket, frontBase, front],
})

// Named exports
export { back, backPocket, frontBase, front, Caleb }
