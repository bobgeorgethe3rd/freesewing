//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { back } from './back.mjs'
import { front } from './front.mjs'
import { pocket } from './pocket.mjs'
import { placket } from './placket.mjs'

// Create new design
const Antiope = new Design({
  data,
  parts: [back, front, pocket, placket],
})

// Named exports
export { back, front, pocket, placket, Antiope }
