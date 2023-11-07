//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { frontBase } from './frontBase.mjs'
import { backBase } from './backBase.mjs'
// import { sleeve } from './sleeve.mjs'

// Create new design
const Scott = new Design({
  data,
  parts: [frontBase, backBase /*  sleeve */],
})

// Named exports
export { frontBase, backBase, /* sleeve, */ Scott }
