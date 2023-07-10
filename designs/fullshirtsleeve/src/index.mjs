//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { sleeve } from './sleeve.mjs'
import { overPlacket } from './overPlacket.mjs'

// Create new design
const Fullshirtsleeve = new Design({
  data,
  parts: [sleeve, overPlacket],
})

// Named exports
export { sleeve, overPlacket, Fullshirtsleeve }
