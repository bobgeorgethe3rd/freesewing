import { waistband as waistbandClaude } from '@freesewing/claude'
import { skirtFront } from './skirtFront.mjs'

export const waistband = {
  name: 'rose.waistband',
  after: skirtFront,
  options: {
    //Imported
    ...waistbandClaude.options,
    //Constants
    waistbandFolded: false, //Altered for Scott
    waistbandOverlapSide: 'left', //Altered for Scott
    waistbandOverlap: 0, //Altered for Scott
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
    if (options.waistbandStyle == 'none') {
      part.hide()
      return part
    } else {
      waistbandClaude.draft(sh)
    }

    if (complete) {
      //title
      macro('title', {
        at: points.title,
        nr: '16',
        title: 'Waistband',
        scale: 1 / 3,
      })
    }

    return part
  },
}
