//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { pocket } from './pocket.mjs'

// Create new design
const Boxpleatpocket = new Design({
  data,
  parts: [pocket],
})

// Named exports
export { pocket, Boxpleatpocket }
