//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { back } from './back.mjs'
import { front } from './front.mjs'

import { neckband } from './neckband.mjs'
import { pocket } from '@freesewing/terry'

// Create new design
const Spencer = new Design({
  data,
  parts: [back, front, neckband, pocket],
})

// Named exports
export { back, front, neckband, pocket, Spencer }
