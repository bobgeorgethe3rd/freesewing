import { collar as draftCollar } from '@freesewing/shirtcollar'
import { collarBand } from './collarBand.mjs'
import { backBase } from './backBase.mjs'
import { back } from './back.mjs'
import { frontBase } from './frontBase.mjs'

export const collar = {
  name: 'shaun.collar',
  after: [backBase, back, frontBase, collarBand],
  measurements: [...draftCollar.measurements],
  options: {
    //Imported
    ...draftCollar.options,
    //Collar
    collar: { bool: true, menu: 'collar' },
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
    if (!options.collar) {
      part.hide()
      return part
    } else {
      draftCollar.draft(sh)
    }
    if (complete) {
      //title
      macro('title', {
        nr: 8,
        title: 'Collar',
        at: points.title,
        cutNr: 2,
        scale: 0.25,
      })
    }

    return part
  },
}
