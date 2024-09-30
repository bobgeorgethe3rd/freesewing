import { pluginBandStraight } from '@freesewing/plugin-bandstraight'
import { pluginBandCurved } from '@freesewing/plugin-bandcurved'
import { backBase } from './backBase.mjs'
import { skirtBase } from './skirtBase.mjs'
import { waistband as waistbandClaude } from '@freesewing/claude'

export const waistband = {
  name: 'scott.waistband',
  after: [backBase, skirtBase],
  hide: {
    after: true,
    inherited: true,
  },
  options: {
    //Imported
    ...waistbandClaude.options,
    //Constants
    waistbandFolded: false, //Altered for Scott
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
    if (options.skirtType == 'none' || options.waistbandStyle == 'none') {
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
        nr: '16',
        title: 'Waistband',
        cutNr: 2,
        scale: 0.25,
      })
    }

    return part
  },
}
