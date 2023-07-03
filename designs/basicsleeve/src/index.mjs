//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { sleevecap } from './sleevecap.mjs'
import { sleeve } from './sleeve.mjs'

// Create new design
const Basicsleeve = new Design({
  data,
  parts: [sleeve],
})

// Named exports
export { sleevecap, sleeve, Basicsleeve }
