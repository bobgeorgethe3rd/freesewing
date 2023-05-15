//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { skirtBase } from './skirtBase.mjs'

// Inherited Parts
import { placket } from '@freesewing/wanda'
import { inseamPocket } from '@freesewing/wanda'
import { boxPleatPocket } from '@freesewing/wanda'
import { pearPocket } from '@freesewing/wanda'
import { watchPocket } from '@freesewing/wanda'

// Create new design
const Fallon = new Design({
  data,
  parts: [skirtBase, placket, inseamPocket, boxPleatPocket, pearPocket],
})

// Named exports
export { skirtBase, placket, inseamPocket, boxPleatPocket, pearPocket, Fallon }
