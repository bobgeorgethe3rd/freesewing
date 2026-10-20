//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { skirtBack } from './skirtBack.mjs'
import { skirtFront } from './skirtFront.mjs'
import { pocket } from './pocket.mjs'

// Create new design
const Playtest = new Design({
  data,
  parts: [skirtBack, skirtFront, pocket],
})

// Named exports
export { skirtBack, skirtFront, Playtest }
