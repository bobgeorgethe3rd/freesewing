import { placket } from '@freesewing/fullshirtsleeve'
import { sleeve } from './sleeve.mjs'

export const sleevePlacket = {
  name: 'shaun.sleevePlacket',
  after: [sleeve],
  options: {
    //Imported
    ...placket.options,
  },
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
    //settings && draft
    if (options.sleeveType != 'full') {
      part.hide()
      return part
    } else {
      placket.draft(sh)
    }

    if (complete) {
      //title
      macro('title', {
        nr: 9,
        title: 'Placket (Sleeve)',
        at: points.title,
        scale: 0.25,
        cutNr: 2,
      })
    }

    return part
  },
}
