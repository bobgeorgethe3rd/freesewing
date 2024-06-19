import { waistband as waistbandStraight } from '@freesewing/waistbandstraight'
import { waistband as waistbandCurved } from '@freesewing/waistbandcurved'
import { leg } from './leg.mjs'

export const waistband = {
  name: 'francis.waistband',
  options: {
    //Imported
    ...waistbandStraight.options,
    ...waistbandCurved.options,
    //Constants
    useVoidStores: false, //Locked for Francis
    waistbandOverlap: 0, //Locked for Francis
    waistbandOverlapSide: 'left', //Locked for Francis
    closurePosition: 'back', //Locked for Francis
    //Style
    waistbandFolded: { bool: true, menu: 'style' }, //Altered for Francis
  },
  after: [leg],
  plugins: [...waistbandStraight.plugins, ...waistbandCurved.plugins],
  draft: (sh) => {
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
    } = sh

    store.set('waistbandMaxButtons', 0)

    if (options.waistbandStyle == 'none') {
      part.hide()
      return part
    } else {
      if (options.waistbandStyle == 'straight') waistbandStraight.draft(sh)
      else waistbandCurved.draft(sh)
    }

    if (complete) {
      macro('title', {
        nr: 4,
        title: 'Waistband ' + utils.capitalize(options.waistbandStyle),
        at: points.title,
        scale: 1 / 3,
      })
    }
    return part
  },
}
