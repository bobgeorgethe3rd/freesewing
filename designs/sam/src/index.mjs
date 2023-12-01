//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { back } from './back.mjs'

// Create new design
const Sam = new Design({
  data,
  parts: [back],
})

// Named exports
export { back, Sam }
