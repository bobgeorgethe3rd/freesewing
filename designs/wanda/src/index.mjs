//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { skirtBase } from './skirtBase.mjs'
import { centreFront } from './centreFront.mjs'
import { sideFront } from './sideFront.mjs'

// Create new design
const Wanda = new Design({
  data,
  parts: [skirtBase, centreFront, sideFront],
})

// Named exports
export { skirtBase, centreFront, sideFront, Wanda }
