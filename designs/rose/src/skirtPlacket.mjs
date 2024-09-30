import { skirtPlacket as skirtPlacketScott } from '@freesewing/scott'
import { placket } from './placket.mjs'

export const skirtPlacket = {
  name: 'rose.skirtPlacket',
  after: placket,
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
    if (
      options.closurePosition != 'back' ||
      options.placketStyle == 'none' ||
      options.placketStyle == 'inbuilt' ||
      options.waistbandStyle == 'none'
    ) {
      part.hide()
      return part
    } else {
      skirtPlacketScott.draft(sh)
    }

    if (complete) {
      //title
      macro('title', {
        at: points.title,
        nr: '15',
        title: 'Placket (Skirt)',
        cutNr: 2,
        scale: 0.15,
      })
    }

    return part
  },
}
