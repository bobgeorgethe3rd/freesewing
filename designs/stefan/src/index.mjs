//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { body } from './body.mjs'
import { sleeve } from './sleeve.mjs'

// Create new design
const Stefan = new Design({
  data,
  parts: [body, sleeve],
})

// Named exports
export { body, sleeve, Stefan }
