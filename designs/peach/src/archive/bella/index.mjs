//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { frontBase } from './frontBase.mjs'
import { backBase } from './backBase.mjs'
import { front } from './front.mjs'
import { sideFront } from './sideFront.mjs'
import { back } from './back.mjs'
import { sideBack } from './sideBack.mjs'

// Create new design
const Peach = new Design({
  data,
  parts: [frontBase, backBase, front, sideFront, back, sideBack],
})

// Named exports
export { frontBase, backBase, front, sideFront, back, sideBack, Peach }
