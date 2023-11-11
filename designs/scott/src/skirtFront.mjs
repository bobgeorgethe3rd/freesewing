import { skirtBase } from './skirtBase.mjs'
import { pocket } from './pocket.mjs'
import { skirtFront as skirtFrontClaude } from '@freesewing/claude'
import { skirtFront as skirtFrontDaisy } from '@freesewing/harriet'

export const skirtFront = {
  name: 'scott.skirtFront',
  from: skirtBase,
  after: pocket,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Imported
    ...skirtFrontClaude.options,
    ...skirtFrontDaisy.options,
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
    if (options.skirtStyle != 'none') {
      if (options.skirtStyle == 'harriet') {
        skirtFrontDaisy.draft(sh)
      } else {
        skirtFrontClaude.draft(sh)
      }
    } else {
      part.hide()
      return part
    }
    //remove macros
    macro('logorg', false)
    macro('scalebox', false)
    if (complete) {
      //title
      macro('title', {
        at: points.title,
        nr: '7',
        title: 'Skirt (Front)',
        scale: 0.5,
        prefix: 'title',
        rotation: 90 - points.frontHemMid.angle(points.waistFrontMid),
      })
      if (options.skirtFacings) {
        macro('title', {
          at: points.titleFacing,
          nr: '11',
          title: 'Skirt Facing (Front)',
          scale: 0.5,
          prefix: 'titleFacing',
          rotation: 90 - points.frontHemMid.angle(points.frontHemFacingMid),
        })
      }
    }

    return part
  },
}
