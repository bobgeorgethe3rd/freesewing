//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { crownTop } from './crownTop.mjs'
import { crownSide } from './crownSide.mjs'

// Create new design
const Playtest = new Design({
  data,
  parts: [crownTop, crownSide],
})

// Named exports
export { crownTop, crownSide, Playtest }
