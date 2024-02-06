//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { sleeve } from './sleeve.mjs'
import { band } from './band.mjs'

// Create new design
const Simpleraglanshirtsleeve = new Design({
  data,
  parts: [sleeve, band],
})

// Named exports
export { sleeve, band, Simpleraglanshirtsleeve }
