//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { skirtBase } from './skirtBase.mjs'
import { centreFront } from './centreFront.mjs'
import { sideFront } from './sideFront.mjs'
import { sideBack } from './sideBack.mjs'
import { backPanel } from './backPanel.mjs'
import { waistbandStraight } from './waistbandStraight.mjs'
import { waistbandCurved } from './waistbandCurved.mjs'

// Inherited Parts
import { placket } from '@freesewing/wanda'
import { inseamPocket } from '@freesewing/wanda'
import { boxPleatPocket } from '@freesewing/wanda'
import { pearPocket } from '@freesewing/wanda'
import { watchPocket } from '@freesewing/wanda'

// Create new design
const Fallon = new Design({
  data,
  parts: [
    skirtBase,
    centreFront,
    sideFront,
    sideBack,
    backPanel,
    waistbandStraight,
    waistbandCurved,
    placket,
    inseamPocket,
    boxPleatPocket,
    pearPocket,
    watchPocket,
  ],
})

// Named exports
export {
  skirtBase,
  sideFront,
  sideBack,
  centreFront,
  backPanel,
  waistbandStraight,
  waistbandCurved,
  placket,
  inseamPocket,
  boxPleatPocket,
  pearPocket,
  watchPocket,
  Fallon,
}
