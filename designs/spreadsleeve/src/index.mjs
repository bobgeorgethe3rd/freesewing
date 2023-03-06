//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { sleeveBase } from './sleeveBase.mjs'
import { sleeve } from './sleeve.mjs'

// Create new design
const Spreadsleeve = new Design({
  data,
  parts: [sleeveBase, sleeve],
})

// Named exports
export { sleeveBase, sleeve, Spreadsleeve }
