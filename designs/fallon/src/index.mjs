//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { skirtBase } from './skirtBase.mjs'
import { centreFront } from './centreFront.mjs'
import { sideFront } from './sideFront.mjs'
import { backPanel } from './backPanel.mjs'

// Inherited Parts
import { placket } from '@freesewing/wanda'
import { inseamPocket } from '@freesewing/wanda'
import { boxPleatPocket } from '@freesewing/wanda'
import { pearPocket } from '@freesewing/wanda'

// Create new design
const Fallon = new Design({
  data,
  parts: [
    skirtBase,
    centreFront,
    sideFront,
    backPanel,
    placket,
    inseamPocket,
    boxPleatPocket,
    pearPocket,
  ],
})

// Named exports
export {
  skirtBase,
  sideFront,
  centreFront,
  backPanel,
  placket,
  inseamPocket,
  boxPleatPocket,
  pearPocket,
  Fallon,
}
