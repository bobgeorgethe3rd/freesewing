//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { front } from './front.mjs'
import { back } from './back.mjs'
import { pocket } from './pocket.mjs'
import { ruffleGuide } from './ruffleGuide.mjs'

// Create new design
const Bernice = new Design({
  data,
  parts: [front, back, pocket, ruffleGuide],
})

// Named exports
export { front, back, pocket, ruffleGuide, Bernice }
