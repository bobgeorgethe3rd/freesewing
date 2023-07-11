//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { collarBase } from './collarBase.mjs'
import { collarBand } from './collarBand.mjs'
import { collar } from './collar.mjs'

// Create new design
const Shirtcollar = new Design({
  data,
  parts: [collarBand, collar],
})

// Named exports
export { collarBase, collarBand, collar, Shirtcollar }
