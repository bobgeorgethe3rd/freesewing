import { frontPocketFacingB as frontPocketFacingBJackson } from '@freesewing/jackson'
import { frontPocketFacing } from './frontPocketFacing.mjs'

export const frontPocketFacingB = {
  name: 'jack.frontPocketFacingB',
  from: frontPocketFacing,
  options: {
    //Imports
    ...frontPocketFacingBJackson.options,
  },
  draft: frontPocketFacingBJackson.draft,
}
