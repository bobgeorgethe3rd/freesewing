//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { front } from './front.mjs'
import { back } from './back.mjs'
import { frontPlacket } from './frontPlacket.mjs'
import { neckTie } from './neckTie.mjs'
import { collar } from './collar.mjs'
import { belt } from './belt.mjs'
import { cummerbund } from './cummerbund.mjs'
import { pocket } from './pocket.mjs'
import { pocketFlap } from './pocketFlap.mjs'

// Create new design
const Shannon = new Design({
  data,
  parts: [front, back, frontPlacket, neckTie, collar, belt, cummerbund, pocket, pocketFlap],
})

// Named exports
export { front, back, frontPlacket, neckTie, collar, belt, cummerbund, pocket, pocketFlap, Shannon }
