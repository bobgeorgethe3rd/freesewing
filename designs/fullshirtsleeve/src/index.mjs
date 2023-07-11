//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { sleeve } from './sleeve.mjs'
import { placket } from './placket.mjs'
import { cuff } from './cuff.mjs'

// Create new design
const Fullshirtsleeve = new Design({
  data,
  parts: [sleeve, placket, cuff],
})

// Named exports
export { sleeve, placket, cuff, Fullshirtsleeve }
