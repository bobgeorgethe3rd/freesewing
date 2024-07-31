//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { front } from './front.mjs'
import { back } from './back.mjs'
import { waistband } from './waistband.mjs'
//Inherited Parts
import { pocket } from '@freesewing/claude'
import { waistFacingFront } from '@freesewing/claude'
import { waistFacingBack } from '@freesewing/claude'
import { beltLoops } from '@freesewing/claude'

// Create new design
const Claire = new Design({
  data,
  parts: [front, back, waistband, pocket, waistFacingFront, waistFacingBack, beltLoops],
})

// Named exports
export { front, back, waistband, pocket, waistFacingFront, waistFacingBack, beltLoops, Claire }
