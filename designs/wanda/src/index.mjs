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
import { pocket } from './pocket.mjs'
import { watchPocket } from './watchPocket.mjs'
import { placket } from './placket.mjs'
import { waistband } from './waistband.mjs'

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
    pocket,
    watchPocket,
    placket,
    waistband,
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
  pocket,
  watchPocket,
  placket,
  waistband,
  Wanda,
}
