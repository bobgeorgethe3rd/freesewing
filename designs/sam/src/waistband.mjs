import { pluginBandStraight } from '@freesewing/plugin-bandstraight'
import { pluginBandCurved } from '@freesewing/plugin-bandcurved'
import { waistband as waistbandClaude } from '@freesewing/claude'
import { skirtFront } from './skirtFront.mjs'

export const waistband = {
  name: 'sam.waistband',
  after: skirtFront,
  options: {
    //Imported
    ...waistbandClaude.options,
    //Constants
    waistbandFolded: false, //Altered for Scott
    waistbandOverlapSide: 'left', //Altered for Scott
    waistbandOverlap: 0, //Altered for Scott
  },
  plugins: [pluginBandStraight, pluginBandCurved],
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
        nr: '13',
        title: 'Waistband',
        cutNr: 2,
        scale: 0.25,
      })
    }

    return part
  },
}
