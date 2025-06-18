//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { back } from './back.mjs'
import { front } from './front.mjs'
import { pocket } from './pocket.mjs'
import { placket } from './placket.mjs'
import { waistband } from './waistband.mjs'
import { waistFacingBack } from './waistFacingBack.mjs'
import { waistFacingFront } from './waistFacingFront.mjs'

// Create new design
const Antiope = new Design({
  data,
  parts: [back, front, pocket, placket, waistband, waistFacingBack, waistFacingFront],
})

// Named exports
export { back, front, pocket, placket, waistband, waistFacingBack, waistFacingFront, Antiope }
