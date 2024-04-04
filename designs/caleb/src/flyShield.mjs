import { flyShield as flyShieldFlyFront } from '@freesewing/flyfront'
import { frontBase } from './frontBase.mjs'

export const flyShield = {
  name: 'caleb.flyShield',
  from: frontBase,
  hide: {
    from: true,
  },
  options: {
    //Imported
    ...flyShieldFlyFront.options,
  },
  draft: (sh) => {
    const { points, complete, macro, part } = sh
    //draft
    flyShieldFlyFront.draft(sh)

    if (complete) {
      //title
      macro('title', {
        at: points.title,
        nr: 8,
        title: 'Fly Shield',
        scale: 0.25,
        rotation: 90 - points.flyShieldCorner.angle(points.flyShieldWaist),
      })
    }
    return part
  },
}
