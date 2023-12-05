//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { frontBase } from './frontBase.mjs'

// Create new design
const Shannon = new Design({
  data,
  parts: [frontBase],
})

// Named exports
export { frontBase, Shannon }
