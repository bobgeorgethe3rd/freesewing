//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { front } from './front.mjs'
import { sideFront } from './sideFront.mjs'
import { back } from './back.mjs'
import { sideBack } from './sideBack.mjs'

// Create new design
const Rose = new Design({
  data,
  parts: [front, sideFront, back, sideBack],
})

// Named exports
export { front, sideFront, back, sideBack, Rose }
