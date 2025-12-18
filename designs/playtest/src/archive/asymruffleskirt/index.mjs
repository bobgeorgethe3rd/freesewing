//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { skirtBackBase } from './skirtBackBase.mjs'
import { skirtBack } from './skirtBack.mjs'
import { skirtBackRuffle } from './skirtBackRuffle.mjs'

// Create new design
const Playtest = new Design({
  data,
  parts: [skirtBackBase, skirtBack, skirtBackRuffle],
})

// Named exports
export { skirtBackBase, skirtBack, skirtBackRuffle, Playtest }
