//

import { Design } from '@freesewing/core'
import { i18n } from '../i18n/index.mjs'
import { data } from '../data.mjs'
// Parts
import { dress } from './dress.mjs'

import { channel } from './channel.mjs'

// Create new design
const Siona = new Design({
  data,
  parts: [dress, channel],
})

// Named exports
export { dress, channel, i18n, Siona }
