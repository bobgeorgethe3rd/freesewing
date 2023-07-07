//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { backBase } from './backBase.mjs'
import { back } from './back.mjs'
import { yokeBack } from './yokeBack.mjs'
import { frontBase } from './frontBase.mjs'
import { frontLeft } from './frontLeft.mjs'

// Create new design
const Shaun = new Design({
  data,
  parts: [backBase, back, yokeBack, frontBase, frontLeft],
})

// Named exports
export { backBase, back, yokeBack, frontBase, frontLeft, Shaun }
