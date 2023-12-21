import { sleevecap } from '@freesewing/basicsleeve'
import { back } from './back.mjs'

export const dolmanSleeve = {
  name: 'shannon.dolmanSleeve',
  after: back,
  options: {
    //Imported
    ...sleevecap.options,
  },
  draft: (sh) => {
    //draft
    const { points, options, complete, macro, store, part } = sh
    sleevecap.draft(sh)

    if (complete) {
      //title
      points.title = points.midAnchor.shiftFractionTowards(points.sleeveCapRight, 0.25)
    }

    return part
  },
}
