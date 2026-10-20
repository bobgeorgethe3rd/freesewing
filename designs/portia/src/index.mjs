//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { skirtBack } from './skirtBack.mjs'
import { skirtFront } from './skirtFront.mjs'
import { pocket } from './pocket.mjs'
import { waistband } from './waistband.mjs'
import { waistFacingBack } from './waistFacingBack.mjs'
import { waistFacingFront } from './waistFacingFront.mjs'

// Create new design
const Portia = new Design({
  data,
  parts: [skirtBack, skirtFront, pocket, waistband, waistFacingBack, waistFacingFront],
})

// Named exports
export { skirtBack, skirtFront, pocket, waistband, waistFacingBack, waistFacingFront, Portia }
