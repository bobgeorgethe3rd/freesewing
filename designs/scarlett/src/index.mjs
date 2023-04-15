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
import { placket } from './placket.mjs'
import { waistbandStraight } from './waistbandStraight.mjs'
import { waistbandCurved } from './waistbandCurved.mjs'

import { inseamPocket } from '@freesewing/wanda'
import { boxPleatPocket } from '@freesewing/wanda'
import { pearPocket } from '@freesewing/wanda'
import { watchPocket } from '@freesewing/wanda'
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
    placket,
    waistbandStraight,
    waistbandCurved,
    inseamPocket,
    boxPleatPocket,
    pearPocket,
    watchPocket,
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
  placket,
  waistbandStraight,
  waistbandCurved,
  inseamPocket,
  boxPleatPocket,
  pearPocket,
  watchPocket,
  Scarlett,
}
