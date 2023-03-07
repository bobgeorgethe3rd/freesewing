//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { sleeve } from './sleeve.mjs'

// Create new design
const Rufflebutterflysleeve = new Design({
  data,
  parts: [sleeve],
})

// Named exports
export { sleeve, Rufflebutterflysleeve }
