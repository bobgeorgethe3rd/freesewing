import { fly as flyFlyFront } from '@freesewing/flyfront'
import { frontBase } from './frontBase.mjs'

export const fly = {
  name: 'caleb.fly',
  from: frontBase,
  hide: {
    from: true,
  },
  options: {
    //Imported
    ...flyFlyFront.options,
  },
  draft: (sh) => {
    const { points, options, complete, macro, part } = sh
    //draft
    flyFlyFront.draft(sh)

    if (complete) {
      //title
      macro('title', {
        at: points.title,
        nr: 6,
        title: 'Fly',
        cutNr: options.flyFrontButtonholePlacket ? 1 : 2,
        scale: 0.25,
        rotation: 90 - points.flyCurveStart.angle(points.flyWaist),
      })
    }

    return part
  },
}
