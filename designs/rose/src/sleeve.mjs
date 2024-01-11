import { sleeveBase } from '@freesewing/spreadsleeve'
import { sleeve as capSleeve } from '@freesewing/capsleeve'
import { back } from './back.mjs'

export const sleeve = {
  name: 'rose.sleeve',
  from: sleeveBase,
  after: back,
  hide: {
    from: true,
  },
  options: {
    //Imported
    ...capSleeve.options,
    //Constants
    useVoidStores: false, //Locked for Rose
    sleeveFlounces: 'none', //Locked for Rose
    sleeveBands: false, //Locked for Rose
    //Sleeves
    sleevesBool: { bool: true, menu: 'sleeves' },
    //Construction
    sleeveHemWidth: { pct: 2, min: 1, max: 3, menu: 'construction' }, //Altered for Rose
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
    if (options.sleevesBool) {
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
        scale: 0.4,
      })
    }

    return part
  },
}
