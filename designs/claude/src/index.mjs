//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { skirtBase } from './skirtBase.mjs'
import { skirtFront } from './skirtFront.mjs'
import { skirtBack } from './skirtBack.mjs'
import { pocket } from './pocket.mjs'
import { waistbandStraight } from './waistbandStraight.mjs'
import { waistbandCurved } from './waistbandCurved.mjs'
import { placket } from './placket.mjs'

// Create new design
const Claude = new Design({
  data,
  parts: [skirtBase, skirtFront, skirtBack, pocket, waistbandStraight, waistbandCurved, placket],
})

// Named exports
export {
  skirtBase,
  skirtFront,
  skirtBack,
  pocket,
  waistbandStraight,
  waistbandCurved,
  placket,
  Claude,
}
