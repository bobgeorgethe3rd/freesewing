import { front } from '@freesewing/sammie'
import { pocket as pocketClaude } from '@freesewing/claude'

export const pocket = {
  name: 'sam.pocket',
  after: [front, pocketClaude.after],
  options: {
    //Imported
    ...pocketClaude.options,
    //Constants
  },
  measurements: ['wrist'],
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
    if (!options.pocketsBool) {
      part.hide()
      return part
    } else {
      pocketClaude.draft(sh)
    }

    if (complete) {
      //title
      macro('title', {
        at: points.title,
        nr: '8',
        title: 'Pocket',
        cutNr: 4,
        scale: 1 / 3,
      })
    }

    return part
  },
}
