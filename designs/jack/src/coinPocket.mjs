import { coinPocket as coinPocketJackson } from '@freesewing/jackson'
import { frontPocketFacing } from './frontPocketFacing.mjs'

export const coinPocket = {
  name: 'jack.coinPocket',
  from: frontPocketFacing,
  options: {
    //Imports
    ...coinPocketJackson.options,
  },
  draft: coinPocketJackson.draft,
}
