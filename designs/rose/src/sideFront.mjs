import { frontBase } from '@freesewing/daisy'
import { sideFrontArmholePitch } from '@freesewing/peach'
import { front } from './front.mjs'

export const sideFront = {
  name: 'rose.sideFront',
  from: frontBase,
  after: front,
  hide: {
    from: true,
  },
  options: {
    //Imported
    ...sideFrontArmholePitch.options,
  },
  draft: (sh) => {
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
      log,
    } = sh

    if (options.bodiceStyle == 'seam') {
      sideFrontArmholePitch.draft(sh)
    } else {
      part.hide()
      return part
    }

    if (complete) {
      macro('title', {
        at: points.title,
        nr: '7',
        title: 'Side Front',
        scale: 0.5,
      })
    }

    return part
  },
}
