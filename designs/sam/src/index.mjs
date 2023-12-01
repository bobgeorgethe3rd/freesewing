//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { back } from '@freesewing/sammie'
import { sideBack } from '@freesewing/sammie'
import { front } from '@freesewing/sammie'
import { sideFront } from '@freesewing/sammie'
import { backFacing } from '@freesewing/sammie'
import { frontFacing } from '@freesewing/sammie'

import { skirtFront } from './skirtFront.mjs'
import { skirtBack } from './skirtBack.mjs'
import { pocket } from './pocket.mjs'
import { waistband } from './waistband.mjs'

// Create new design
const Sam = new Design({
  data,
  parts: [
    back,
    sideBack,
    front,
    sideFront,
    backFacing,
    frontFacing,
    skirtFront,
    skirtBack,
    pocket,
    waistband,
  ],
})

// Named exports
export {
  back,
  sideBack,
  front,
  sideFront,
  backFacing,
  frontFacing,
  skirtFront,
  skirtBack,
  pocket,
  waistband,
  Sam,
}
