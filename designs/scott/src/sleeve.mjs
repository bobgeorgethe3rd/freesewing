import { sleeveBase } from '@freesewing/spreadsleeve'
import { sleeve as spreadleeve } from '@freesewing/spreadsleeve'
import { backBase } from './backBase.mjs'
import { frontBase } from './frontBase.mjs'

export const sleeve = {
  name: 'scott.sleeve',
  from: sleeveBase,
  after: [backBase, frontBase],
  hide: {
    from: true,
  },
  options: {
    //Imported
    ...spreadleeve.options,
    //Constants
    useVoidStores: false, //Altered fro Scott
    sleeveFlounces: 'none', //Locked for Scott
    //Sleeves
    sleevesBool: { bool: true, menu: 'sleeves' },
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
      spreadleeve.draft(sh)
    } else {
      part.hide()
      return part
    }

    if (complete) {
      //title
      macro('title', {
        nr: 5,
        title: 'Sleeve',
        at: points.title,
        scale: 0.5,
      })
    }

    return part
  },
}
