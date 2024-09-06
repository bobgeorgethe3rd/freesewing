//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { body } from './body.mjs'
import { sleeve } from './sleeve.mjs'
import { sleeveGusset } from './sleeveGusset.mjs'
import { sleeveBand } from './sleeveBand.mjs'
import { sleeveBandRuffle } from './sleeveBandRuffle.mjs'
import { neckband } from './neckband.mjs'
import { neckbandRuffle } from './neckbandRuffle.mjs'

// Create new design
const Stefan = new Design({
  data,
  parts: [body, sleeve, sleeveGusset, sleeveBand, sleeveBandRuffle, neckbandRuffle, neckband],
})

// Named exports
export {
  body,
  sleeve,
  sleeveGusset,
  sleeveBand,
  sleeveBandRuffle,
  neckband,
  neckbandRuffle,
  Stefan,
}
