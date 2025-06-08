//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { base } from './base.mjs'
import { back } from './back.mjs'
import { front } from './front.mjs'

// Create new design
const Sarah = new Design({
  data,
  parts: [base, back, front],
})

// Named exports
export { base, back, front, Sarah }
