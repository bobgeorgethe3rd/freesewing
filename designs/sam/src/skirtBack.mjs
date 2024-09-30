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
      let titleCutNum = 2
      if (options.closurePosition != 'back' && options.cbSaWidth == 0) titleCutNum = 1
      if (options.skirtPanels <= 1) {
        macro('title', {
          at: points.title,
          nr: '9',
          title: 'Skirt (Back)',
          cutNr: titleCutNum,
          scale: 0.5,
          prefix: 'title',
          rotation: 90 - points.backHemMid.angle(points.waistBackMid),
        })
        if (options.skirtFacings) {
          macro('title', {
            at: points.titleFacing,
            nr: '12',
            title: 'Skirt Facing (Back)',
            cutNr: titleCutNum,
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
          cutNr: titleCutNum,
          scale: 0.15,
          prefix: 'title',
        })
        if (options.skirtFacings) {
          macro('title', {
            at: points.titleFacing,
            nr: '12',
            title: 'Skirt Facing A (Back)',
            cutNr: titleCutNum,
            scale: 0.15,
            prefix: 'titleFacing',
          })
        }
        let j
        let k
        for (let i = 0; i < options.skirtPanels - 1; i++) {
          j = String.fromCharCode(i + 98)
          k = String.fromCharCode(i + 66)
          macro('title', {
            at: points['title' + i],
            nr: '9' + j,
            title: 'Skirt Back ' + k + ' (Back)',
            prefix: 'title ' + i,
            cutNr: 2,
            onFold: false,
            scale: 0.15,
            rotation: 90 - points['backHemPanel' + i].angle(points['waistBackPanel' + i]),
          })

          if (options.skirtFacings) {
            macro('title', {
              at: points['titleFacing' + i],
              nr: '12' + j,
              title: 'Skirt Facing ' + k + ' (Back)',
              prefix: 'titleFacing ' + i,
              cutNr: 2,
              onFold: false,
              scale: 0.15,
              rotation: 90 - points['backHemPanel' + i].angle(points['waistBackPanel' + i]),
            })
          }
        }
      }
    }

    return part
  },
}
