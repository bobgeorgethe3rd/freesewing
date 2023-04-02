//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { base } from './base.mjs'
import { centreFront } from './centreFront.mjs'

// Create new design
const Calanthe = new Design({
  data,
  parts: [base, centreFront],
})

// Named exports
export { base, centreFront, Calanthe }
