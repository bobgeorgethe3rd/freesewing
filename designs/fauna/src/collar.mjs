import { pctBasedOn } from '@freesewing/core'
import { collar as draftCollar } from '@freesewing/standardcollar'
import { backBase } from './backBase.mjs'
import { frontBase } from './frontBase.mjs'

export const collar = {
  name: 'fauna.collar',
  after: [backBase, frontBase],
  measurements: [...draftCollar.measurements],
  options: {
    //Imported
    ...draftCollar.options,
    //Collars
    collarWidth: {
      pct: 19.2,
      min: 10,
      max: 30,
      snap: 1.25,
      ...pctBasedOn('hpsToWaistBack'),
      menu: 'collar',
    }, //Altered for Fauna
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
    draftCollar.draft(sh)
    if (complete) {
      //title
      macro('title', {
        nr: 5,
        title: 'Collar',
        at: points.title,
        cutNr: options.cbCollarSaWidth == 0 ? 2 : 4,
        scale: 0.25,
      })
    }

    return part
  },
}
