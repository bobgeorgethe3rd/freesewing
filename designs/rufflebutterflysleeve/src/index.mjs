//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { sleeve } from './sleeve.mjs'
import { sleeveFlounce } from './sleeveFlounce.mjs'

// Create new design
const Rufflebutterflysleeve = new Design({
  data,
  parts: [sleeve, sleeveFlounce],
})

// Named exports
export { sleeve, sleeveFlounce, Rufflebutterflysleeve }
