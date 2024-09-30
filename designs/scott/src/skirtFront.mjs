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
    if (options.skirtType != 'none') {
      if (options.skirtType == 'harriet') {
        skirtFrontDaisy.draft(sh)
      } else {
        skirtFrontClaude.draft(sh)
      }
    } else {
      part.hide()
      return part
    }
    //remove macros
    macro('title', false)
    macro('logorg', false)
    macro('scalebox', false)
    if (complete) {
      //title
      let titleCutNum = 2
      if (options.closurePosition != 'front' && options.cfSaWidth == 0) titleCutNum = 1

      if (options.skirtPanels > 1) {
        let j
        let k
        for (let i = 0; i < options.skirtPanels - 1; i++) {
          j = String.fromCharCode(i + 98)
          k = String.fromCharCode(i + 66)

          macro('title', {
            at: points['title' + i],
            nr: '7' + j,
            title: 'Skirt ' + k + ' (Front)',
            prefix: 'title ' + i,
            cutNr: 2,
            onFold: false,
            scale: 0.15,
            rotation: 90 - points['frontHemPanel' + i].angle(points['waistFrontPanel' + i]),
          })

          if (options.skirtFacings) {
            macro('title', {
              at: points['titleFacing' + i],
              nr: '10' + j,
              title: 'Skirt Facing ' + k + ' (Front)',
              prefix: 'titleFacing ' + i,
              cutNr: 2,
              onFold: false,
              scale: 0.15,
              rotation: 90 - points['frontHemPanel' + i].angle(points['waistFrontPanel' + i]),
            })
          }
        }
        macro('title', {
          at: points.title,
          nr: '7a',
          title: 'Skirt A' + ' (Front)',
          scale: 0.15,
          cutNr: titleCutNum,
          prefix: 'title',
        })
        if (options.skirtFacings) {
          macro('title', {
            at: points.titleFacing,
            nr: '10a',
            title: 'Skirt Facing A' + ' (Front)',
            prefix: 'titleFacing',
            cutNr: titleCutNum,
            scale: 0.15,
          })
        }
      } else {
        macro('title', {
          at: points.title,
          nr: '7',
          title: 'Skirt (Front)',
          scale: 0.5,
          cutNr: titleCutNum,
          prefix: 'title',
          rotation: 90 - points.frontHemMid.angle(points.waistFrontMid),
        })
        if (options.skirtFacings) {
          macro('title', {
            at: points.titleFacing,
            nr: '10',
            title: 'Skirt Facing (Front)',
            scale: 0.5,
            cutNr: titleCutNum,
            prefix: 'titleFacing',
            rotation: 90 - points.frontHemMid.angle(points.frontHemFacingMid),
          })
        }
      }
    }

    return part
  },
}
