import { cuff } from '@freesewing/fullshirtsleeve'
import { sleeve } from './sleeve.mjs'
import { sleevePlacket } from './sleevePlacket.mjs'

export const sleeveCuff = {
  name: 'shaun.sleeveCuff',
  after: [sleeve, sleevePlacket],
  options: {
    //Imported
    ...cuff.options,
    //Sleeves
    sleeveBandCurve: { pct: 0, min: 0, max: 100, menu: 'sleeves.cuffs' }, //Altered for Shaun
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
      cuff.draft(sh)
    }

    if (complete) {
      //title
      let titleCutNum = 2
      if (options.sleeveBandFolded) titleCutNum = 1
      macro('title', {
        nr: 10,
        title: 'Placket (Cuff)',
        at: points.title,
        cutNr: titleCutNum,
        scale: 0.25,
      })
    }

    return part
  },
}
