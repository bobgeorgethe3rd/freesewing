//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { skirtFront } from './skirtFront.mjs'
import { skirtBack } from './skirtBack.mjs'
//Inherited Parts
import { pocket } from '@freesewing/claude'
import { placket } from '@freesewing/claude'
import { waistband } from '@freesewing/claude'
import { waistFacingFront } from '@freesewing/claude'
import { waistFacingBack } from '@freesewing/claude'
import { beltLoops } from '@freesewing/claude'
// Create new design
const Harvey = new Design({
  data,
  parts: [
    skirtFront,
    skirtBack,
    pocket,
    placket,
    waistband,
    waistFacingFront,
    waistFacingBack,
    beltLoops,
  ],
})

// Named exports
export {
  skirtFront,
  skirtBack,
  pocket,
  placket,
  waistband,
  waistFacingFront,
  waistFacingBack,
  beltLoops,
  Harvey,
}
