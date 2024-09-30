import { buttonholePlacket as buttonholePlacketFlyFront } from '@freesewing/flyfront'
import { frontBase } from './frontBase.mjs'

export const buttonholePlacket = {
  name: 'theobald.buttonholePlacket',
  from: frontBase,
  hide: {
    from: true,
  },
  options: {
    //Imported
    ...buttonholePlacketFlyFront.options,
  },
  draft: (sh) => {
    const { points, paths, options, complete, macro, part } = sh
    //daltonGuides
    if (options.daltonGuides) {
      paths.seam = paths.daltonGuide
    }
    //draft
    buttonholePlacketFlyFront.draft(sh)

    if (complete) {
      //title
      macro('title', {
        at: points.title,
        nr: 9,
        title: 'Buttonhole Placket',
        cutNr: 1,
        scale: 0.25,
        rotation: 90 - points.flyCurveStart.angle(points.flyWaist),
      })
    }

    return part
  },
}
