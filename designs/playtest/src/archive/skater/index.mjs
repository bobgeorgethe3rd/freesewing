//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { frontBase } from './frontBase.mjs'
import { centreFront } from './centreFront.mjs'
import { sideFront } from './sideFront.mjs'
import { backBase } from './backBase.mjs'
import { centreBack } from './centreBack.mjs'
import { sideBack } from './sideBack.mjs'

// Create new design
const Playtest = new Design({
  data,
  parts: [frontBase, centreFront, sideFront, backBase, centreBack, sideBack],
})

// Named exports
export { frontBase, centreFront, sideFront, backBase, centreBack, sideBack, Playtest }
