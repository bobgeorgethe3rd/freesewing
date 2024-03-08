import { flyShield as flyShieldFlyFront } from '@freesewing/flyfront'
import { frontBase } from './frontBase.mjs'

export const flyShield = {
  name: 'theobald.flyShield',
  from: frontBase,
  hide: {
    from: true,
  },
  options: {
    //Imported
    ...flyShieldFlyFront.options,
  },
  draft: (sh) => {
    const { points, paths, options, complete, macro, part } = sh
    //dalton guide
    if (options.daltonGuides) {
      paths.seam = paths.daltonGuide
    }
    //draft
    flyShieldFlyFront.draft(sh)

    if (complete) {
      //title
      macro('title', {
        at: points.title,
        nr: 10,
        title: 'Fly Shield',
        scale: 0.25,
        rotation: 90 - points.flyShieldCorner.angle(points.flyShieldWaist),
      })
    }
    return part
  },
}
