import { collar as draftCollar } from '@freesewing/shirtcollar'
import { collarBand } from './collarBand.mjs'
import { frontBase } from './frontBase.mjs'

export const collar = {
  name: 'playtest.collar',
  after: [frontBase, collarBand],
  options: {
    //Imported
    ...draftCollar.options,
    //Collar
    collar: { bool: true, menu: 'collar' },
    collarWidth: { pct: 71.5, min: 0, max: 100, menu: 'collar' }, //Altered for Playtest
    collarPeakWidth: { pct: 15, min: 5, max: 100, menu: 'collar' }, //Altered for Playtest
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
        nr: '9',
        title: 'Collar',
        at: points.title,
        cutNr: 2,
        scale: 0.25,
      })
    }

    return part
  },
}
