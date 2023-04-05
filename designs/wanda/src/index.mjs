//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { skirtBase } from './skirtBase.mjs'
import { centreFront } from './centreFront.mjs'

// Create new design
const Wanda = new Design({
  data,
  parts: [skirtBase, centreFront],
})

// Named exports
export { skirtBase, centreFront, Wanda }
