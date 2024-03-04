import { sleeveBase as spreadSleeveBase } from '@freesewing/spreadsleeve'
import { back } from './back.mjs'

export const sleeveBase = {
  name: 'rose.sleeveBase',
  after: back,
  hide: {
    from: true,
  },
  from: spreadSleeveBase.from,
  options: {
    //Imported
    ...spreadSleeveBase.options,
    //Constants
    useVoidStores: false, //Locked for Rose
    sleeveFlounces: 'none', //Locked for Rose
    sleeveBands: false, //Locked for Rose
    //Sleeves
    sleevesBool: { bool: true, menu: 'sleeves' },
    spread: { pct: 0, min: 0, max: 120, menu: 'sleeves' }, //Altered for Rose
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
      spreadSleeveBase.draft(sh)
    } else {
      part.hide()
      return part
    }

    return part
  },
}
