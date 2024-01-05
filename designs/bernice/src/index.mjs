//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { front } from './front.mjs'
import { back } from './back.mjs'
import { ruffleGuide } from './ruffleGuide.mjs'

// Create new design
const Bernice = new Design({
  data,
  parts: [front, back, ruffleGuide],
})

// Named exports
export { front, back, ruffleGuide, Bernice }
