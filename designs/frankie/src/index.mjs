//

import { Design } from '@freesewing/core'
import { i18n } from '../i18n/index.mjs'
import { data } from '../data.mjs'
// Parts
import { back } from './back.mjs'
import { frontBase } from './frontBase.mjs'
import { front } from './front.mjs'
import { fly } from './fly.mjs'
import { buttonholePlacket } from './buttonholePlacket.mjs'
import { flyShield } from './flyShield.mjs'
import { waistband } from './waistband.mjs'
import { frontPocketBag } from './frontPocketBag.mjs'
import { sidePocket } from './sidePocket.mjs'
import { beltLoops } from './beltLoops.mjs'

// Create new design
const Frankie = new Design({
  data,
  parts: [
    back,
    frontBase,
    front,
    fly,
    flyShield,
    buttonholePlacket,
    waistband,
    frontPocketBag,
    sidePocket,
    beltLoops,
  ],
})

// Named exports
export {
  back,
  frontBase,
  front,
  fly,
  buttonholePlacket,
  flyShield,
  waistband,
  frontPocketBag,
  sidePocket,
  beltLoops,
  i18n,
  Frankie,
}
