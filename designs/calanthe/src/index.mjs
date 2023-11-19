//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { base } from './base.mjs'
import { centreFront } from './centreFront.mjs'
import { frontPanel } from './frontPanel.mjs'
import { sideFront } from './sideFront.mjs'
import { sideBack } from './sideBack.mjs'
// import { backPanel } from './backPanel.mjs'
// import { centreBack } from './centreBack.mjs'

// Create new design
const Calanthe = new Design({
  data,
  parts: [base, centreFront, frontPanel, sideFront, sideBack /* backPanel, */ /* centreBack */],
})

// Named exports
export {
  base,
  centreFront,
  frontPanel,
  sideFront,
  sideBack,
  /* backPanel, */ /* centreBack, */ Calanthe,
}
