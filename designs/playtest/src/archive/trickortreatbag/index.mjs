//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { template } from './template.mjs'

// Create new design
const Playtest = new Design({
  data,
  parts: [template],
})

// Named exports
export { template, Playtest }
