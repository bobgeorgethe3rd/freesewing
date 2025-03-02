//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { backBase } from './backBase.mjs'
import { yokeBack } from './yokeBack.mjs'
import { back } from './back.mjs'

// Create new design
const Fauna = new Design({
  data,
  parts: [backBase, yokeBack, back],
})

// Named exports
export { backBase, yokeBack, back, Fauna }
