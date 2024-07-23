//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { gusset } from './gusset.mjs'
import { leg } from './leg.mjs'
import { panel } from './panel.mjs'
import { waistband } from './waistband.mjs'
import { beltLoops } from './beltLoops.mjs'

// Create new design
const Francis = new Design({
  data,
  parts: [gusset, leg, panel, waistband, beltLoops],
})

// Named exports
export { gusset, leg, panel, waistband, beltLoops, Francis }
