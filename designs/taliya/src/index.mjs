//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { frontBase } from './frontBase.mjs'
import { neckbandFront } from './neckbandFront.mjs'

// Create new design
const Taliya = new Design({
  data,
  parts: [frontBase, neckbandFront],
})

// Named exports
export { frontBase, neckbandFront, Taliya }
