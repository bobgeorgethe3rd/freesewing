//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { frontBase } from './frontBase.mjs'
import { front } from './front.mjs'
import { backBase } from './backBase.mjs'
import { yokeBack } from './yokeBack.mjs'
import { back } from './back.mjs'
import { placketFacing } from './placketFacing.mjs'
import { sleeve } from './sleeve.mjs'

// Create new design
const Fauna = new Design({
  data,
  parts: [frontBase, front, backBase, yokeBack, back, placketFacing, sleeve],
})

// Named exports
export { frontBase, front, backBase, yokeBack, back, placketFacing, sleeve, Fauna }
