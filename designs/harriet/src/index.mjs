//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { skirtBase } from './skirtBase.mjs'
//Inherited Parts
// import { pocket } from '@freesewing/claude'
// import { placket } from '@freesewing/claude'
// import { waistband } from '@freesewing/claude'
// import { beltLoops } from '@freesewing/claude'
// Create new design
const Harriet = new Design({
  data,
  parts: [skirtBase /* pocket, placket, waistband, beltLoops */],
})

// Named exports
export { skirtBase, /*  pocket, placket, waistband, beltLoops, */ Harriet }
