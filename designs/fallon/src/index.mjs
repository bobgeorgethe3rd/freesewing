//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { skirtBase } from './skirtBase.mjs'

// Create new design
const Fallon = new Design({
  data,
  parts: [skirtBase],
})

// Named exports
export { skirtBase, Fallon }
