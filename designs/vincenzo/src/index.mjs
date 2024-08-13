//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { back } from './back.mjs'
import { front } from './front.mjs'
import { pocket } from './pocket.mjs'

// Create new design
const Vincenzo = new Design({
  data,
  parts: [back, front, pocket],
})

// Named exports
export { back, front, pocket, Vincenzo }
