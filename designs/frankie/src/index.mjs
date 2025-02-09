//

import { Design } from '@freesewing/core'
import { i18n } from '../i18n/index.mjs'
import { data } from '../data.mjs'
// Parts
import { back } from './back.mjs'
import { frontBase } from './frontBase.mjs'
import { front } from './front.mjs'

// Create new design
const Frankie = new Design({
  data,
  parts: [back, frontBase, front],
})

// Named exports
export { back, frontBase, front, i18n, Frankie }
