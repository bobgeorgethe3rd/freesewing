import { sleeveBase as spreadSleeveBase } from '@freesewing/spreadsleeve'
import { back } from './back.mjs'

export const sleeveBase = {
  name: 'taliya.sleeveBase',
  after: back,
  hide: {
    from: true,
  },
  from: spreadSleeveBase.from,
  options: {
    //Imported
    ...spreadSleeveBase.options,
    //Constants
    useVoidStores: false, //Locked for Taliya
    sleeveFlounces: 'none', //Locked for Taliya
    sleeveBands: false, //Locked for Taliya
    sleeveLength: 0, //Locked for Taliya
    sleeveLengthBonus: 0, //Locked for Taliya
    //Sleeves
    spread: { pct: 0, min: 0, max: 120, menu: 'sleeves' }, //Altered for Taliya
    //Construction
  },
  measurements: [...spreadSleeveBase.measurements],
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
      spreadSleeveBase.draft(sh)
    } else {
      part.hide()
      return part
    }

    return part
  },
}
