import { placket } from '@freesewing/fullshirtsleeve'
import { sleeve } from './sleeve.mjs'

export const sleevePlacket = {
  name: 'playtest.sleevePlacket',
  after: [sleeve],
  options: {
    //Imported
    ...placket.options,
    //Sleeves
    sleevePlacketWidth: { pct: 12.2, min: 10, max: 20, menu: 'sleeves.plackets' }, //Altered for Playtest
    sleevePlacketTopFactor: { pct: 50, min: 30, max: 100, menu: 'sleeves.plackets' }, //Altered for Playtest
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
    placket.draft(sh)

    if (complete) {
      //title
      macro('title', {
        nr: 7,
        title: 'Placket (Sleeve)',
        at: points.title,
        scale: 0.25,
        cutNr: 2,
      })
    }

    return part
  },
}
