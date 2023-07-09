//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { backBase } from './backBase.mjs'
import { back } from './back.mjs'
import { yokeBack } from './yokeBack.mjs'
import { frontBase } from './frontBase.mjs'
import { frontLeft } from './frontLeft.mjs'
import { frontRight } from './frontRight.mjs'
import { buttonholePlacket } from './buttonholePlacket.mjs'
import { buttonPlacket } from './buttonPlacket.mjs'
import { sleeve } from './sleeve.mjs'

// Create new design
const Shaun = new Design({
  data,
  parts: [
    backBase,
    back,
    yokeBack,
    frontBase,
    frontLeft,
    frontRight,
    buttonholePlacket,
    buttonPlacket,
    sleeve,
  ],
})

// Named exports
export {
  backBase,
  back,
  yokeBack,
  frontBase,
  frontLeft,
  frontRight,
  buttonholePlacket,
  buttonPlacket,
  sleeve,
  Shaun,
}
