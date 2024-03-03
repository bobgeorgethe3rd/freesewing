//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { skirtBase } from './skirtBase.mjs'
import { centreFront } from './centreFront.mjs'
import { sideFront } from './sideFront.mjs'
import { sideBack } from './sideBack.mjs'
import { backPanel } from './backPanel.mjs'
import { pocket } from './pocket.mjs'
import { watchPocket } from './watchPocket.mjs'
import { placket } from './placket.mjs'
import { waistband } from './waistband.mjs'
import { waistFacing } from './waistFacing.mjs'
import { sideWaistFacing } from './sideWaistFacing.mjs'

// Create new design
const Fallon = new Design({
  data,
  parts: [
    skirtBase,
    centreFront,
    sideFront,
    sideBack,
    backPanel,
    pocket,
    watchPocket,
    placket,
    waistband,
    waistFacing,
    sideWaistFacing,
  ],
})

// Named exports
export {
  skirtBase,
  sideFront,
  sideBack,
  centreFront,
  backPanel,
  pocket,
  watchPocket,
  placket,
  waistband,
  waistFacing,
  sideWaistFacing,
  Fallon,
}
