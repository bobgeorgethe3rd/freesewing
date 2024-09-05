//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { body } from './body.mjs'
import { sleeve } from './sleeve.mjs'
import { sleeveGusset } from './sleeveGusset.mjs'

// Create new design
const Stefan = new Design({
  data,
  parts: [body, sleeve, sleeveGusset],
})

// Named exports
export { body, sleeve, sleeveGusset, Stefan }
