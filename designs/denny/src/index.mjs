//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { frontBase } from './frontBase.mjs'
import { backBase } from './backBase.mjs'
import { sleeveBase } from './sleeveBase.mjs'
import { yokeFront } from './yokeFront.mjs'
import { centreFront } from './centreFront.mjs'
import { frontPanel } from './frontPanel.mjs'
import { sideFront } from './sideFront.mjs'
import { frontFacing } from './frontFacing.mjs'
import { yokeBack } from './yokeBack.mjs'
import { centreBack } from './centreBack.mjs'
import { sideBack } from './sideBack.mjs'
import { sleeveBack } from './sleeveBack.mjs'
import { sleeveFront } from './sleeveFront.mjs'
import { sleeveBand } from './sleeveBand.mjs'
import { waistband } from './waistband.mjs'
import { collar } from './collar.mjs'
import { weltPocketBag } from './weltPocketBag.mjs'
import { weltPocketWelt } from './weltPocketWelt.mjs'

// Create new design
const Denny = new Design({
  data,
  parts: [
    frontBase,
    backBase,
    sleeveBase,
    yokeFront,
    centreFront,
    frontPanel,
    sideFront,
    frontFacing,
    yokeBack,
    centreBack,
    sideBack,
    sleeveBack,
    sleeveFront,
    sleeveBand,
    waistband,
    collar,
    weltPocketBag,
    weltPocketWelt,
  ],
})

// Named exports
export {
  frontBase,
  backBase,
  sleeveBase,
  yokeFront,
  centreFront,
  frontPanel,
  sideFront,
  frontFacing,
  yokeBack,
  centreBack,
  sideBack,
  sleeveBack,
  sleeveFront,
  sleeveBand,
  waistband,
  collar,
  weltPocketBag,
  weltPocketWelt,
  Denny,
}
