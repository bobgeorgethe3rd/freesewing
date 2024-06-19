//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { gusset } from './gusset.mjs'
import { leg } from './leg.mjs'
import { panel } from './panel.mjs'
import { waistband } from './waistband.mjs'

// Create new design
const Francis = new Design({
  data,
  parts: [gusset, leg, panel, waistband],
})

// Named exports
export { gusset, leg, panel, waistband, Francis }
