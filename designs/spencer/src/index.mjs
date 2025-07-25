//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { back } from './back.mjs'
import { front } from './front.mjs'
import { armholeBand } from './armholeBand.mjs'
import { neckband } from './neckband.mjs'
import { pocket } from '@freesewing/terry'

// Create new design
const Spencer = new Design({
  data,
  parts: [back, front, armholeBand, neckband, pocket],
})

// Named exports
export { back, front, armholeBand, neckband, pocket, Spencer }
