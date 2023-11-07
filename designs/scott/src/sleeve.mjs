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
    sleeveFlounces: 'none', //Locked for Scott
    //Sleeves
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
    spreadleeve.draft(sh)

    if (complete) {
      //title
      macro('title', {
        nr: 3,
        title: 'Sleeve',
        at: points.title,
        scale: 0.5,
      })
    }

    return part
  },
}
