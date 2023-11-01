//

import { Design } from '@freesewing/core'
import { i18n } from '../i18n/index.mjs'
import { data } from '../data.mjs'
// Parts
import { dress } from './dress.mjs'

// Create new design
const Siona = new Design({
  data,
  parts: [dress],
})

// Named exports
export { dress, i18n, Siona }
