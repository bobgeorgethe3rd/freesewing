//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { flyFunction } from './flyFunction.mjs'
import { flyBase } from './flyBase.mjs'
import { fly } from './fly.mjs'
import { buttonholePlacket } from './buttonholePlacket.mjs'
import { flyShield } from './flyShield.mjs'

// Create new design
const Flyfront = new Design({
  data,
  parts: [flyBase, fly, buttonholePlacket, flyShield],
})

// Named exports
export { flyFunction, flyBase, fly, buttonholePlacket, flyShield, Flyfront }
