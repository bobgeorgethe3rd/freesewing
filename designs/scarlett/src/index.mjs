//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { skirtBase } from './skirtBase.mjs'
import { centreFront } from './centreFront.mjs'
import { swingPanel } from './swingPanel.mjs'
import { sideFront } from './sideFront.mjs'
import { sidePanel } from './sidePanel.mjs'
import { sidePanelB } from './sidePanelB.mjs'
import { backPanel } from './backPanel.mjs'
import { pocket } from './pocket.mjs'
import { placket } from './placket.mjs'
import { watchPocket } from '@freesewing/wanda'
import { swingFacing } from './swingFacing.mjs'
import { swingWaistband } from './swingWaistband.mjs'
import { waistband } from './waistband.mjs'

// Create new design
const Scarlett = new Design({
  data,
  parts: [
    skirtBase,
    centreFront,
    swingPanel,
    sideFront,
    sidePanel,
    sidePanelB,
    backPanel,
    pocket,
    watchPocket,
    placket,
    swingFacing,
    swingWaistband,
    waistband,
  ],
})

// Named exports
export {
  skirtBase,
  centreFront,
  swingPanel,
  sideFront,
  sidePanel,
  sidePanelB,
  backPanel,
  pocket,
  watchPocket,
  placket,
  swingFacing,
  swingWaistband,
  waistband,
  Scarlett,
}
