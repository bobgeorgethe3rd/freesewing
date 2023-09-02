//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { frontBaseArmholePitch } from './frontBaseArmholePitch.mjs'
import { frontBaseArmhole } from './frontBaseArmhole.mjs'
import { frontBaseShoulder } from './frontBaseShoulder.mjs'
import { frontBaseBustShoulder } from './frontBaseBustShoulder.mjs'
import { backBaseArmholePitch } from './backBaseArmholePitch.mjs'
import { backBaseArmhole } from './backBaseArmhole.mjs'
import { backBaseShoulder } from './backBaseShoulder.mjs'
import { backBaseBustShoulder } from './backBaseBustShoulder.mjs'
import { frontArmholePitch } from './frontArmholePitch.mjs'
import { frontArmhole } from './frontArmhole.mjs'
import { frontShoulder } from './frontShoulder.mjs'
import { frontBustShoulder } from './frontBustShoulder.mjs'
import { sideFrontArmholePitch } from './sideFrontArmholePitch.mjs'
import { sideFrontArmhole } from './sideFrontArmhole.mjs'

// Create new design
const Peach = new Design({
  data,
  parts: [
    frontBaseArmholePitch,
    frontBaseArmhole,
    frontBaseShoulder,
    frontBaseBustShoulder,
    backBaseArmholePitch,
    backBaseArmhole,
    backBaseShoulder,
    backBaseBustShoulder,
    frontArmholePitch,
    frontArmhole,
    frontShoulder,
    frontBustShoulder,
    sideFrontArmholePitch,
    sideFrontArmhole,
  ],
})

// Named exports
export {
  frontBaseArmholePitch,
  frontBaseArmhole,
  frontBaseShoulder,
  frontBaseBustShoulder,
  backBaseArmholePitch,
  backBaseArmhole,
  backBaseShoulder,
  backBaseBustShoulder,
  frontArmhole,
  frontShoulder,
  frontBustShoulder,
  sideFrontArmholePitch,
  sideFrontArmhole,
  Peach,
}
