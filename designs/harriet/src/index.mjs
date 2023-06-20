//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { skirtBase } from './skirtBase.mjs'
import { skirtFront } from './skirtFront.mjs'
//Inherited Parts
import { pocket } from '@freesewing/claude'
import { placket } from '@freesewing/claude'
import { waistband } from '@freesewing/claude'
import { waistFacingFront } from '@freesewing/claude'
import { waistFacingBack } from '@freesewing/claude'
import { beltLoops } from '@freesewing/claude'
// Create new design
const Harriet = new Design({
  data,
  parts: [
    skirtBase,
    skirtFront,
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
  skirtBase,
  skirtFront,
  pocket,
  placket,
  waistband,
  waistFacingFront,
  waistFacingBack,
  beltLoops,
  Harriet,
}
