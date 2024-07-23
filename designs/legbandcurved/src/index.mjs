//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { legBand } from './legBand.mjs'

// Create new design
const Legbandcurved = new Design({
  data,
  parts: [legBand],
})

// Named exports
export { legBand, Legbandcurved }
