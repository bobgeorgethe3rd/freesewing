//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { back } from './back.mjs'
import { front } from './front.mjs'
import { neckband } from './neckband.mjs'

// Create new design
const Riley = new Design({
  data,
  parts: [back, front, neckband],
})

// Named exports
export { back, front, neckband, Riley }
