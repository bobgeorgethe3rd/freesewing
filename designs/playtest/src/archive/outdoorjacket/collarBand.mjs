import { pctBasedOn } from '@freesewing/core'
import { collarBand as draftCollarBand } from '@freesewing/shirtcollar'
import { frontBase } from './frontBase.mjs'

export const collarBand = {
  name: 'playtest.collarBand',
  after: [frontBase],
  options: {
    //Imported
    ...draftCollarBand.options,
    //Collars
    collarBandWidth: {
      pct: 7.7,
      min: 5,
      max: 10,
      snap: 5,
      ...pctBasedOn('hpsToWaistBack'),
      menu: 'collar',
    }, //6.5 //Altered for Outdoor Jacket
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
        nr: '11',
        title: 'Collar Band',
        at: points.title,
        cutNr: 2,
        scale: 0.25,
      })
    }

    return part
  },
}
