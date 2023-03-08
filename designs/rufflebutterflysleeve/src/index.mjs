//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { sleeve } from './sleeve.mjs'
import { sleeveFlounce } from './sleeveFlounce.mjs'
import { sleeveChannel } from './sleeveChannel.mjs'
import { sleeveTie } from './sleeveTie.mjs'
import { sleeveBand } from './sleeveBand.mjs'

// Create new design
const Rufflebutterflysleeve = new Design({
  data,
  parts: [sleeve, sleeveFlounce, sleeveChannel, sleeveTie, sleeveBand],
})

// Named exports
export { sleeve, sleeveFlounce, sleeveChannel, sleeveTie, sleeveBand, Rufflebutterflysleeve }
