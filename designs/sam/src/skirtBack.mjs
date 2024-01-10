import { skirtBack as skirtBackClaude } from '@freesewing/claude'
import { pocket } from './pocket.mjs'

export const skirtBack = {
  name: 'sam.skirtBack',
  after: pocket,
  from: skirtBackClaude.from,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Imported
    ...skirtBackClaude.options,
  },
  draft: (sh) => {
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
    } = sh
    //draft
    skirtBackClaude.draft(sh)

    if (complete) {
      //title
      if (options.skirtPanels <= 1) {
        macro('title', {
          at: points.title,
          nr: '9',
          title: 'Skirt (Back)',
          scale: 0.5,
          prefix: 'title',
          rotation: 90 - points.backHemMid.angle(points.waistBackMid),
        })
        if (options.skirtFacings) {
          macro('title', {
            at: points.titleFacing,
            nr: '12',
            title: 'Skirt Facing (Back)',
            scale: 0.5,
            prefix: 'titleFacing',
            rotation: 90 - points.backHemMid.angle(points.backHemFacingMid),
          })
        }
      } else {
        macro('title', {
          at: points.title,
          nr: '9',
          title: 'Skirt A (Back)',
          scale: 0.15,
          prefix: 'title',
        })
        if (options.skirtFacings) {
          macro('title', {
            at: points.titleFacing,
            nr: '12',
            title: 'Skirt Facing A (Back)',
            scale: 0.15,
            prefix: 'titleFacing',
          })
        }
      }
    }

    return part
  },
}
