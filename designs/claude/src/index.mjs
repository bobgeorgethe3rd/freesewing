//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { skirtBase } from './skirtBase.mjs'
import { skirtFront } from './skirtFront.mjs'
import { skirtBack } from './skirtBack.mjs'
import { pocket } from './pocket.mjs'
import { placket } from './placket.mjs'
import { waistbandStraight } from './waistbandStraight.mjs'
import { waistbandCurved } from './waistbandCurved.mjs'
import { waistFacingBase } from './waistFacingBase.mjs'
import { waistFacingFront } from './waistFacingFront.mjs'
import { waistFacingBack } from './waistFacingBack.mjs'

// Create new design
const Claude = new Design({
  data,
  parts: [
    skirtBase,
    skirtFront,
    skirtBack,
    pocket,
    placket,
    waistbandStraight,
    waistbandCurved,
    waistFacingBase,
    waistFacingFront,
    waistFacingBack,
  ],
})

// Named exports
export {
  skirtBase,
  skirtFront,
  skirtBack,
  pocket,
  placket,
  waistbandStraight,
  waistbandCurved,
  waistFacingBase,
  waistFacingFront,
  waistFacingBack,
  Claude,
}
