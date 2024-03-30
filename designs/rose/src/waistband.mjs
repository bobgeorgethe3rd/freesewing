import { pluginBandStraight } from '@freesewing/plugin-bandstraight'
import { pluginBandCurved } from '@freesewing/plugin-bandcurved'
import { waistband as waistbandClaude } from '@freesewing/claude'
import { skirtFront } from './skirtFront.mjs'

export const waistband = {
  name: 'rose.waistband',
  after: skirtFront,
  options: {
    //Imported
    ...waistbandClaude.options,
    //Constants
    waistbandFolded: false, //Altered for Scott
    waistbandOverlapSide: 'left', //Altered for Scott
    waistbandOverlap: 0, //Altered for Scott
  },
  plugins: [pluginBandStraight, pluginBandCurved],
  draft: (sh) => {
    //draft
    const {
      store,
      sa,
      Point,
      points,
      Path,
      paths,
      options,
      complete,
      paperless,
      macro,
      utils,
      measurements,
      part,
      snippets,
      Snippet,
      absoluteOptions,
      log,
    } = sh
    //draft
    if (options.waistbandStyle == 'none') {
      part.hide()
      return part
    } else {
      waistbandClaude.draft(sh)
    }
    delete snippets.waistbandButtonholePlacket

    if (complete) {
      //buttonhole
      if (options.placketStyle != 'none' && options.closurePosition == 'back') {
        points.waistbandButtonholePlacket = points.waistbandButtonPlacket.flipX()
        if (options.waistbandOverlapSide == 'right') {
          snippets.buttonholePlacket = new Snippet(
            'buttonhole',
            points.waistbandButtonholePlacket
          ).attr('data-rotate', 180 - points.waistbandBottomRight.angle(points.waistbandTopRight))
        } else {
          snippets.buttonholePlacket = new Snippet(
            'buttonhole',
            points.waistbandButtonholePlacket
          ).attr('data-rotate', 180 - points.waistbandBottomLeft.angle(points.waistbandTopLeft))
        }
      }
      //title
      macro('title', {
        at: points.title,
        nr: '9',
        title: 'Waistband',
        scale: 1 / 3,
      })
    }

    return part
  },
}
