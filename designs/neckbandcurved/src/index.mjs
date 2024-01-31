//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { neckband } from './neckband.mjs'

// Create new design
const Neckbandcurved = new Design({
  data,
  parts: [neckband],
})

// Named exports
export { neckband, Neckbandcurved }
