//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { skirtBase } from './skirtBase.mjs'
import { swingPanel } from './swingPanel.mjs'
import { centreFront } from './centreFront.mjs'
import { sideFront } from './sideFront.mjs'

import { inseamPocket } from '@freesewing/wanda'
import { boxPleatPocket } from '@freesewing/wanda'
import { pearPocket } from '@freesewing/wanda'
import { watchPocket } from '@freesewing/wanda'
// Create new design
const Scarlett = new Design({
  data,
  parts: [
    skirtBase,
    swingPanel,
    centreFront,
    sideFront,
    inseamPocket,
    boxPleatPocket,
    pearPocket,
    watchPocket,
  ],
})

// Named exports
export {
  skirtBase,
  swingPanel,
  centreFront,
  sideFront,
  inseamPocket,
  boxPleatPocket,
  pearPocket,
  watchPocket,
  Scarlett,
}
