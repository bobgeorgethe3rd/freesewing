//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { back } from './back.mjs'
import { backPocket } from './backPocket.mjs'

//Imported parts

import { yokeBack } from '@freesewing/jackson'

// Create new design
const Jack = new Design({
  data,
  parts: [back, yokeBack, backPocket],
})

// Named exports
export { back, yokeBack, backPocket, Jack }
