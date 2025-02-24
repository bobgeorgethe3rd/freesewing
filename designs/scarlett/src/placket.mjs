import { placket as wandaPlacket } from '@freesewing/wanda'
import { frontPlacket } from './frontPlacket.mjs'

export const placket = {
  name: 'scarlett.placket',
  options: {
    //Imported
    ...wandaPlacket.options,
  },
  draft: (sh) => {
    const {
      macro,
      points,
      Point,
      paths,
      Path,
      utils,
      options,
      measurements,
      snippets,
      Snippet,
      store,
      complete,
      part,
    } = sh
    //set Render
    if (!options.plackets) {
      part.hide()
      return part
    }
    if (options.waistbandStyle != 'none' && options.closurePosition == 'front') {
      frontPlacket.from.from.draft(sh)
      frontPlacket.from.draft(sh)
      frontPlacket.draft(sh)
    } else wandaPlacket.draft(sh)

    if (complete) {
      //title
      macro('title', {
        nr: 7,
        title: 'Placket',
        at: points.title,
        cutNr: 2,
        scale: 0.15,
      })
    }

    return part
  },
}
