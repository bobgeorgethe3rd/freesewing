//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { back } from './back.mjs'
import { front } from './front.mjs'
import { neckband } from './neckband.mjs'
import { sleeve } from './sleeve.mjs'
import { pocket } from './pocket.mjs'

// Create new design
const Terry = new Design({
  data,
  parts: [back, front, neckband, sleeve, pocket],
})

// Named exports
export { back, front, neckband, sleeve, pocket, Terry }
