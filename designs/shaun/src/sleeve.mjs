import { sleeve as fullshirtsleeve } from '@freesewing/fullshirtsleeve'
import { sleeve as simpleshirtsleeve } from '@freesewing/simpleshirtsleeve'
import { backBase } from './backBase.mjs'
import { back } from './back.mjs'
import { frontBase } from './frontBase.mjs'

export const sleeve = {
  name: 'shaun.sleeve',
  after: [backBase, back, frontBase],
  measurements: [...fullshirtsleeve.measurements, ...simpleshirtsleeve.measurements],
  options: {
    //Imported
    ...fullshirtsleeve.options,
    ...simpleshirtsleeve.options,
    //Constants
    sleeveBands: false, //Altered for Shaun
    //Sleeves
    sleeveType: { dflt: 'full', list: ['full', 'short'], menu: 'sleeves' },
    sleeveHemStyle: { dflt: 'cuffed', list: ['cuffed', 'turnover'], menu: 'sleeves' }, //Altered for Shaun
    sleeveLength: { pct: 25, min: 15, max: 50, menu: 'sleeves' }, //Altered for Shaun
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
    if (options.sleeveType == 'full') {
      options.sleeveLength = 1
      options.sleeveBands = true
      fullshirtsleeve.draft(sh)
    } else {
      simpleshirtsleeve.draft(sh)
    }

    if (complete) {
      //title
      macro('title', {
        nr: 6,
        title: 'Sleeve (' + utils.capitalize(options.sleeveType) + ')',
        at: points.title,
        scale: 0.5,
      })
    }

    return part
  },
}
