import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { base } from './base.mjs'

// Create new design
const Deborah = new Design({
  data,
  parts: [base],
})

// Named exports
export { base, Deborah }
