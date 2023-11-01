//

import { Design } from '@freesewing/core'
import { i18n } from '../i18n/index.mjs'
import { data } from '../data.mjs'
// Parts
import { dress } from './dress.mjs'

import { belt } from './belt.mjs'
import { beltLoops } from './beltLoops.mjs'
import { channel } from './channel.mjs'

// Create new design
const Siona = new Design({
  data,
  parts: [dress, belt, beltLoops, channel],
})

// Named exports
export { dress, belt, beltLoops, channel, i18n, Siona }
