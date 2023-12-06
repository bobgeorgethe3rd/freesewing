//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { frontBase } from './frontBase.mjs'
import { back } from './back.mjs'

// Create new design
const Shannon = new Design({
  data,
  parts: [frontBase, back],
})

// Named exports
export { frontBase, back, Shannon }
