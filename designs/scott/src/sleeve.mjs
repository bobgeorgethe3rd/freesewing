import { sleeve as spreadSleeve } from '@freesewing/spreadsleeve'
import { sleeveBase } from './sleeveBase.mjs'
import { backBase } from './backBase.mjs'
import { frontBase } from './frontBase.mjs'

export const sleeve = {
  name: 'scott.sleeve',
  from: sleeveBase,
  after: [backBase, frontBase],
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Imported
    ...spreadSleeve.options,
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
      spreadSleeve.draft(sh)
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
