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
    if (options.skirtStyle == 'none' || options.waistbandStyle == 'none') {
      part.hide()
      return part
    } else {
      waistbandClaude.draft(sh)
    }

    /*   if (complete) {
      //buttonhole
      if (options.placketStyle != 'none' && options.closurePosition == 'back') {
        points.buttonholePlacket = points.buttonPlacket.flipX()
        if (options.waistbandOverlapSide == 'right') {
          snippets.buttonholePlacket = new Snippet('buttonhole', points.buttonholePlacket).attr(
            'data-rotate',
            180 - points.bottomRight.angle(points.topRight)
          )
        } else {
          snippets.buttonholePlacket = new Snippet('buttonhole', points.buttonholePlacket).attr(
            'data-rotate',
            180 - points.bottomLeft.angle(points.topLeft)
          )
        }
      }
      //title
      macro('title', {
        at: points.title,
        nr: '16',
        title: 'Waistband',
        scale: 1 / 3,
      })
    } */

    return part
  },
}
