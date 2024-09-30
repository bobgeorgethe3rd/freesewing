import { fly as flyFlyFront } from '@freesewing/flyfront'
import { frontBase } from './frontBase.mjs'

export const fly = {
  name: 'theobald.fly',
  from: frontBase,
  hide: {
    from: true,
  },
  options: {
    //Imported
    ...flyFlyFront.options,
  },
  draft: (sh) => {
    const { points, paths, options, complete, macro, part } = sh
    //daltonGuides
    if (options.daltonGuides) {
      paths.seam = paths.daltonGuide
    }
    //draft
    flyFlyFront.draft(sh)

    if (complete) {
      //title
      macro('title', {
        at: points.title,
        nr: 8,
        title: 'Fly',
        cutNr: 1,
        scale: 0.25,
        rotation: 90 - points.flyCurveStart.angle(points.flyWaist),
      })
    }

    return part
  },
}
