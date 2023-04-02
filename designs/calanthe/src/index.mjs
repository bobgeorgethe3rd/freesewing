//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { base } from './base.mjs'
import { centreFront } from './centreFront.mjs'
import { front1 } from './front1.mjs'
import { sideFront } from './sideFront.mjs'
import { sideBack } from './sideBack.mjs'
import { back1 } from './back1.mjs'
import { centreBack } from './centreBack.mjs'

// Create new design
const Calanthe = new Design({
  data,
  parts: [base, centreFront, front1, sideFront, sideBack, back1, centreBack],
})

// Named exports
export { base, centreFront, front1, sideFront, sideBack, back1, centreBack, Calanthe }
