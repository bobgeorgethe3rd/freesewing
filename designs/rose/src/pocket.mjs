import { pocket as pocketClaude } from '@freesewing/claude'
import { back } from './back.mjs'

export const pocket = {
  name: 'rose.pocket',
  after: [back, pocketClaude.after],
  options: {
    //Imported
    ...pocketClaude.options,
    //Style
    // skirtStyle: { dflt: 'rose', list:['claude', 'rose', 'none'], menu: 'style'},
    skirtBool: { bool: true, menu: 'style' },
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
    if (!options.pocketsBool || !options.skirtBool) {
      part.hide()
      return part
    } else {
      pocketClaude.draft(sh)
    }

    if (complete) {
      //title
      macro('title', {
        at: points.title,
        nr: '10',
        title: 'Pocket',
        scale: 1 / 3,
      })
    }

    return part
  },
}
