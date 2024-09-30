import { collarBand as draftCollarBand } from '@freesewing/shirtcollar'
import { backBase } from './backBase.mjs'
import { back } from './back.mjs'
import { frontBase } from './frontBase.mjs'

export const collarBand = {
  name: 'shaun.collarBand',
  after: [backBase, back, frontBase],
  measurements: [...draftCollarBand.measurements],
  options: {
    //Imported
    ...draftCollarBand.options,
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
    draftCollarBand.draft(sh)

    if (complete) {
      //title
      macro('title', {
        nr: 7,
        title: 'Collar Band',
        at: points.title,
        cutNr: 2,
        scale: 0.25,
      })
    }

    return part
  },
}
