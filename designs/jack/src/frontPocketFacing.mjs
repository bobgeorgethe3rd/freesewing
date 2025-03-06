import { frontPocketFacing as frontPocketFacingJackson } from '@freesewing/jackson'
import { frontPocketBag } from './frontPocketBag.mjs'

export const frontPocketFacing = {
  name: 'jack.frontPocketFacing',
  from: frontPocketBag,
  options: {
    //Imports
    ...frontPocketFacingJackson.options,
  },
  draft: frontPocketFacingJackson.draft,
}
