//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { pocket } from './pocket.mjs'
import { pocketFlap } from './pocketFlap.mjs'

// Create new design
const Patchpocket = new Design({
  data,
  parts: [pocket, pocketFlap],
})

// Named exports
export { pocket, pocketFlap, Patchpocket }
