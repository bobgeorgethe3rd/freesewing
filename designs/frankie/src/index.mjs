//

import { Design } from '@freesewing/core'
import { i18n } from '../i18n/index.mjs'
import { data } from '../data.mjs'
// Parts
import { back } from './back.mjs'

// Create new design
const Frankie = new Design({
  data,
  parts: [back],
})

// Named exports
export { back, i18n, Frankie }
