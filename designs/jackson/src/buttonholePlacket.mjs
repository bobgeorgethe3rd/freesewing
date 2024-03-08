import { buttonholePlacket as buttonholePlacketFlyFront } from '@freesewing/flyfront'
import { frontBase } from './frontBase.mjs'

export const buttonholePlacket = {
  name: 'jackson.buttonholePlacket',
  from: frontBase,
  hide: {
    from: true,
  },
  options: {
    //Imported
    ...buttonholePlacketFlyFront.options,
  },
  draft: (sh) => {
    const { points, complete, macro, part } = sh
    //draft
    buttonholePlacketFlyFront.draft(sh)

    if (complete) {
      //title
      macro('title', {
        at: points.title,
        nr: 9,
        title: 'Buttonhole Placket',
        scale: 0.25,
        rotation: 90 - points.flyCurveStart.angle(points.flyWaist),
      })
    }

    return part
  },
}
