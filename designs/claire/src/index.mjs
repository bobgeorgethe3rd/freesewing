//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { legFront } from './legFront.mjs'
import { legBack } from './legBack.mjs'
import { placket } from './placket.mjs'
import { waistband } from './waistband.mjs'
//Inherited Parts
import { pocket } from '@freesewing/claude'
import { waistFacingFront } from '@freesewing/claude'
import { waistFacingBack } from '@freesewing/claude'
import { beltLoops } from '@freesewing/claude'

// Create new design
const Claire = new Design({
  data,
  parts: [legFront, legBack, waistband, pocket, waistFacingFront, waistFacingBack, beltLoops],
})

// Named exports
export {
  legFront,
  legBack,
  placket,
  waistband,
  pocket,
  waistFacingFront,
  waistFacingBack,
  beltLoops,
  Claire,
}
