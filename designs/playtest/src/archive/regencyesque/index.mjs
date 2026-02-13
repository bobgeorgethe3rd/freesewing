//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { frontBase } from './frontBase.mjs'
import { backBase } from './backBase.mjs'
import { front } from './front.mjs'
import { sleeve } from './sleeve.mjs'

// Create new design
const Playtest = new Design({
  data,
  parts: [frontBase, backBase, front, sleeve],
})

// Named exports
export { frontBase, backBase, front, sleeve, Playtest }
