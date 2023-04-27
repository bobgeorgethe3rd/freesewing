//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { pocket } from './pocket.mjs'
import { welt } from './welt.mjs'
import { tab } from './tab.mjs'

// Create new design
const Weltpocket = new Design({
  data,
  parts: [pocket, welt, tab],
})

// Named exports
export { pocket, welt, tab, Weltpocket }
