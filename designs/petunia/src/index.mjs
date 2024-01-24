//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { frontBase } from './frontBase.mjs'
import { backBase } from './backBase.mjs'
import { centreFront } from './centreFront.mjs'
import { sideFront } from './sideFront.mjs'
import { frontTop } from './frontTop.mjs'
import { back } from './back.mjs'
import { sideBack } from './sideBack.mjs'

// Create new design
const Petunia = new Design({
  data,
  parts: [frontBase, backBase, centreFront, sideFront, frontTop, back, sideBack],
})

// Named exports
export { frontBase, backBase, centreFront, sideFront, frontTop, back, sideBack, Petunia }
