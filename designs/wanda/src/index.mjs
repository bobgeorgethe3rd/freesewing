//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { skirtBase } from './skirtBase.mjs'
import { centreFront } from './centreFront.mjs'
import { sideFront } from './sideFront.mjs'
import { sidePanel } from './sidePanel.mjs'
import { sidePanelB } from './sidePanelB.mjs'
import { backPanel } from './backPanel.mjs'
import { placket } from './placket.mjs'
import { waistbandStraight } from './waistbandStraight.mjs'
import { waistbandCurved } from './waistbandCurved.mjs'

// Create new design
const Wanda = new Design({
  data,
  parts: [
    skirtBase,
    centreFront,
    sideFront,
    sidePanel,
    sidePanelB,
    backPanel,
    placket,
    waistbandStraight,
    waistbandCurved,
  ],
})

// Named exports
export {
  skirtBase,
  centreFront,
  sideFront,
  sidePanel,
  sidePanelB,
  backPanel,
  placket,
  waistbandStraight,
  waistbandCurved,
  Wanda,
}
