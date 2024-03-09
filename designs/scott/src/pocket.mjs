import { skirtBase } from './skirtBase.mjs'
import { pocket as pocketClaude } from '@freesewing/claude'

export const pocket = {
  name: 'scott.pocket',
  after: skirtBase,
  hide: {
    after: true,
    inherited: true,
  },
  options: {
    //Imported
    ...pocketClaude.options,
    //Constants
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
    if (options.skirtType == 'none' || !options.pocketsBool) {
      part.hide()
      return part
    } else {
      pocketClaude.draft(sh)
    }

    if (complete) {
      //title
      macro('title', {
        at: points.title,
        nr: '9',
        title: 'Pocket',
        scale: 1 / 3,
      })
    }

    return part
  },
}
