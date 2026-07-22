//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { body } from './body.mjs'
import { pocket } from './pocket.mjs'
import { sleeve } from './sleeve.mjs'
import { gusset } from './gusset.mjs'
import { neckband } from './neckband.mjs'

// Create new design
const Frederick = new Design({
  data,
  parts: [body, pocket, sleeve, gusset, neckband],
})

// Named exports
export { body, pocket, sleeve, gusset, neckband, Frederick }
