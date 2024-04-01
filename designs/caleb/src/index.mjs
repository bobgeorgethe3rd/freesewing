//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { back } from './back.mjs'
import { frontBase } from './frontBase.mjs'

// Create new design
const Caleb = new Design({
  data,
  parts: [back, frontBase],
})

// Named exports
export { back, frontBase, Caleb }
