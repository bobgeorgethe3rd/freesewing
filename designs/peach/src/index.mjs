//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { front } from './front.mjs'
import { sideFront } from './sideFront.mjs'
import { back } from './back.mjs'
import { sideBack } from './sideBack.mjs'
//Export Only
import { frontArmholePitch } from './frontArmholePitch.mjs'
import { frontArmhole } from './frontArmhole.mjs'
import { frontShoulder } from './frontShoulder.mjs'
import { frontBustShoulder } from './frontBustShoulder.mjs'
import { sideFrontArmholePitch } from './sideFrontArmholePitch.mjs'
import { sideFrontArmhole } from './sideFrontArmhole.mjs'
import { sideFrontShoulder } from './sideFrontShoulder.mjs'
import { sideFrontBustShoulder } from './sideFrontBustShoulder.mjs'
import { backArmholePitch } from './backArmholePitch.mjs'
import { backArmhole } from './backArmhole.mjs'
import { backShoulder } from './backShoulder.mjs'
import { backBustShoulder } from './backBustShoulder.mjs'
import { sideBackArmholePitch } from './sideBackArmholePitch.mjs'
import { sideBackArmhole } from './sideBackArmhole.mjs'
import { sideBackShoulder } from './sideBackShoulder.mjs'
import { sideBackBustShoulder } from './sideBackBustShoulder.mjs'

// Create new design
const Peach = new Design({
  data,
  parts: [
    front,
    sideFront,
    back,
    sideBack,
    /* //Export Only */
    // frontArmholePitch,
    // frontArmhole,
    // frontShoulder,
    // frontBustShoulder,
    // sideFrontArmholePitch,
    // sideFrontArmhole,
    // sideFrontShoulder,
    // sideFrontBustShoulder,
    // backArmholePitch,
    // backArmhole,
    // backShoulder,
    // backBustShoulder,
    // sideBackArmholePitch,
    // sideBackArmhole,
    // sideBackShoulder,
    // sideBackBustShoulder,
  ],
})

// Named exports
export {
  front,
  sideFront,
  back,
  sideBack,
  //Export Only
  frontArmholePitch,
  frontArmhole,
  frontShoulder,
  frontBustShoulder,
  sideFrontArmholePitch,
  sideFrontArmhole,
  sideFrontShoulder,
  sideFrontBustShoulder,
  backArmholePitch,
  backArmhole,
  backShoulder,
  backBustShoulder,
  sideBackArmholePitch,
  sideBackArmhole,
  sideBackShoulder,
  sideBackBustShoulder,
  Peach,
}
