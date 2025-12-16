import { sleeve as fullshirtsleeve } from '@freesewing/fullshirtsleeve'
import { sleeve as simpleshirtsleeve } from '@freesewing/simpleshirtsleeve'
import { frontBase } from './frontBase.mjs'

export const sleeve = {
  name: 'playtest.sleeve',
  after: [frontBase],
  measurements: [...fullshirtsleeve.measurements],
  options: {
    //Imported
    ...fullshirtsleeve.options,
    //Fit
    wristEase: { pct: 48.5, min: 0, max: 50, menu: 'fit' }, //Altered for Playtest
    //Sleeves
    sleeveLengthBonus: { pct: 19.7, min: -50, max: 50, menu: 'sleeves' }, //Altered for Playtest
    sleeveBottomCurve: { pct: 0, min: 0, max: 2, menu: 'sleeves' }, //Altered for Playtest
    sleevePlacketLength: { pct: 20, min: 15, max: 35, menu: 'sleeves.plackets' }, //Altered for Playtest
    sleeveSlitFactor: { pct: 74, min: 65, max: 80, menu: 'sleeves.plackets' }, //Altered for Playtest
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
    fullshirtsleeve.draft(sh)

    if (complete) {
      //title
      macro('title', {
        nr: 6,
        title: 'Sleeve',
        at: points.title,
        cutNr: 2,
        scale: 0.5,
      })
    }

    return part
  },
}
