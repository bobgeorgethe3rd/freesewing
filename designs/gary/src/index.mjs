//

import { Design } from '@freesewing/core'
import { i18n } from '../i18n/index.mjs'
import { data } from '../data.mjs'
// Parts
import { feet } from './feet.mjs'
import { body } from './body.mjs'
import { base } from './base.mjs'
import { beard } from './beard.mjs'
import { coat } from './coat.mjs'
import { arms } from './arms.mjs'
import { hands } from './hands.mjs'
import { hat } from './hat.mjs'
import { coatTrim } from './coatTrim.mjs'
import { hatTrim } from './hatTrim.mjs'
// Create new design
const Gary = new Design({
  data,
  parts: [feet, body, base, beard, coat, arms, hands, hat, coatTrim, hatTrim],
})

// Named exports
export { feet, body, base, beard, arms, coat, hands, hat, coatTrim, hatTrim, i18n, Gary }
