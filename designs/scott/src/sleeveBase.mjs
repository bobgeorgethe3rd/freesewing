import { sleeveBase as spreadSleeveBase } from '@freesewing/spreadsleeve'
import { backBase } from './backBase.mjs'
import { frontBase } from './frontBase.mjs'

export const sleeveBase = {
  name: 'scott.sleeveBase',
  after: [backBase, frontBase],
  hide: {
    from: true,
  },
  from: spreadSleeveBase.from,
  options: {
    //Imported
    ...spreadSleeveBase.options,
    //Constants
    useVoidStores: false, //Altered for Scott
    sleeveFlounces: 'none', //Locked for Scott
    //Sleeves
    sleevesBool: { bool: true, menu: 'sleeves' },
    sleeveBands: { bool: true, menu: 'sleeves' },
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
