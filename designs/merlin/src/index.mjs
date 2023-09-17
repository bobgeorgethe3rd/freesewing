//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { crown } from './crown.mjs'
import { brim } from './brim.mjs'
import { lining } from './lining.mjs'
import { stars } from './stars.mjs'
import { moons } from './moons.mjs'
import { cats } from './cats.mjs'
import { bats } from './bats.mjs'

//Export Only
import { apBase } from './apBase.mjs'

// Create new design
const Merlin = new Design({
  data,
  parts: [crown, brim, lining, stars, moons, cats, bats],
})

// Named exports
export {
  crown,
  brim,
  lining,
  stars,
  moons,
  cats,
  bats,
  //Export Only
  apBase,
  Merlin,
}
