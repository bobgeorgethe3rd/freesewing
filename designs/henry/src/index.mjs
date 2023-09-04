//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { crown } from './crown.mjs'
import { earFlap } from './earFlap.mjs'
import { visor } from './visor.mjs'

// Create new design
const Henry = new Design({
  data,
  parts: [crown, earFlap, visor],
})

// Named exports
export { crown, earFlap, visor, Henry }
