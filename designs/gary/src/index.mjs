//

import { Design } from '@freesewing/core'
import { i18n } from '../i18n/index.mjs'
import { data } from '../data.mjs'
// Parts
import { feet } from './feet.mjs'
import { body } from './body.mjs'
import { base } from './base.mjs'
import { arms } from './arms.mjs'
import { hands } from './hands.mjs'
// Create new design
const Gary = new Design({
  data,
  parts: [feet, body, base, arms, hands],
})

// Named exports
export { feet, body, base, arms, hands, i18n, Gary }
