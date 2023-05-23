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
import { waistband } from './waistband.mjs'
// import { waistbandStraight } from './waistbandStraight.mjs'
// import { waistbandCurved } from './waistbandCurved.mjs'
import { pocket } from './pocket.mjs'
// import { inseamPocket } from './inseamPocket.mjs'
// import { boxPleatPocket } from './boxPleatPocket.mjs'
// import { pearPocket } from './pearPocket.mjs'
import { watchPocket } from './watchPocket.mjs'

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
    waistband,
    // waistbandStraight,
    // waistbandCurved,
    pocket,
    // inseamPocket,
    // boxPleatPocket,
    // pearPocket,
    watchPocket,
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
  waistband,
  // waistbandStraight,
  // waistbandCurved,
  pocket,
  // inseamPocket,
  // boxPleatPocket,
  // pearPocket,
  watchPocket,
  Wanda,
}
