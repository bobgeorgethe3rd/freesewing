//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { collar } from './collar.mjs'

// Create new design
const Standardcollar = new Design({
  data,
  parts: [collar],
})

// Named exports
export { collar, Standardcollar }
