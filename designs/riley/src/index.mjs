//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { back } from './back.mjs'
import { front } from './front.mjs'
import { sleeve } from './sleeve.mjs'
import { neckband } from './neckband.mjs'
import { pocket } from '@freesewing/terry'

// Create new design
const Riley = new Design({
  data,
  parts: [back, front, sleeve, neckband, pocket],
})

// Named exports
export { back, front, sleeve, neckband, pocket, Riley }
