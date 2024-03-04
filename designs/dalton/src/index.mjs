//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { back } from './back.mjs'
import { front } from './front.mjs'

// Create new design
const Dalton = new Design({
  data,
  parts: [back, front],
})

// Named exports
export { back, front, Dalton }
