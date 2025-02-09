//

import { Design } from '@freesewing/core'
import { i18n } from '../i18n/index.mjs'
import { data } from '../data.mjs'
// Parts
import { back } from './back.mjs'
import { frontBase } from './frontBase.mjs'

// Create new design
const Frankie = new Design({
  data,
  parts: [back, frontBase],
})

// Named exports
export { back, frontBase, i18n, Frankie }
