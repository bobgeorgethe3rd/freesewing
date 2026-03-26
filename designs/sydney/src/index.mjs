//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { backBase } from './backBase.mjs'
import { back } from './back.mjs'
import { front } from './front.mjs'
import { neckband } from './neckband.mjs'
import { sleeve } from './sleeve.mjs'
import { pocket } from './pocket.mjs'

// Create new design
const Sydney = new Design({
  data,
  parts: [backBase, back, front, neckband, sleeve, pocket],
})

// Named exports
export { backBase, back, front, neckband, sleeve, pocket, Sydney }
