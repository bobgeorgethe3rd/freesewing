import { sleeve as capSleeve } from '@freesewing/capsleeve'
// import { sleeveBase } from './sleeveBase.mjs'
import { back } from './back.mjs'

export const sleeve = {
  name: 'taliya.sleeve',
  // from: sleeveBase,
  after: back,
  // hide: {
  // from: true,
  // },
  options: {
    //Imported
    ...capSleeve.from.options,
    ...capSleeve.options,
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
    //draft
    if (options.sleeveStyle == 'inset') {
      capSleeve.from.draft(sh)
      capSleeve.draft(sh)
    } else {
      part.hide()
      return part
    }

    if (complete) {
      //title
      macro('title', {
        at: points.title,
        nr: '3',
        title: 'Sleeve (' + utils.capitalize(options.spreadType) + ' Spread)',
        cutNr: 2,
        scale: 0.4,
      })
    }

    return part
  },
}
