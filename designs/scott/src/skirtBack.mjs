import { skirtBase } from './skirtBase.mjs'
import { pocket } from './pocket.mjs'
import { skirtBack as skirtBackClaude } from '@freesewing/claude'
import { skirtBack as skirtBackDaisy } from '@freesewing/harriet'

export const skirtBack = {
  name: 'scott.skirtBack',
  from: skirtBase,
  after: pocket,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Imported
    ...skirtBackClaude.options,
    ...skirtBackDaisy.options,
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
        skirtBackDaisy.draft(sh)
      } else {
        skirtBackClaude.draft(sh)
      }
    } else {
      part.hide()
      return part
    }
    //macro removal
    macro('title', false)
    //measurements
    const buttonholeStart = absoluteOptions.buttonholeStart
    //let's begin
    if (options.placketStyle != 'none' && options.closurePosition == 'back') {
      const placketWidth = store.get('placketWidth')
      if (options.placketStyle == 'separate') {
        points.waistTop = points.cbWaist
      }
      if (options.placketStyle == 'inbuilt') {
        points.waistTop = points.cbWaist.shift(180, placketWidth * 2)
      }
      if (options.placketStyle == 'facing') {
        points.waistTop = points.cbWaist.shift(180, placketWidth)
      }
      points.waistBottom = new Point(points.waistTop.x, points.cbHem.y)

      //paths
      paths.hemBase = new Path()
        .move(points.waistBottom)
        .line(paths.hemBase.start())
        .join(paths.hemBase)
        .hide()

      paths.waist = paths.waist.line(points.waistTop).hide()

      paths.seam = paths.hemBase
        .join(paths.sideSeam)
        .join(paths.waist)
        .line(points.waistBottom)
        .close()

      if (complete) {
        //facings
        if (options.skirtFacings) {
          if (options.placketStyle == 'separate') {
            points.hemFacingTop = points.cbHemFacing
          }
          if (options.placketStyle == 'inbuilt') {
            points.hemFacingTop = points.cbHemFacing.shift(180, placketWidth * 2)
          }
          if (options.placketStyle == 'facing') {
            points.hemFacingTop = points.cbHemFacing.shift(180, placketWidth)
          }
          //needs the .end() line otherwise sa split can break later on
          paths.facing = new Path()
            .move(points.hemFacingTop)
            .line(paths.facing.start())
            .join(paths.facing)
            .line(paths.facing.end())
            .attr('class', 'interfacing')
            .attr('data-text', 'Facing Line')
            .attr('data-text-class', 'center')
        }
        //lines & buttonholes
        if (options.closurePosition == 'back') {
          if (options.placketStyle == 'inbuilt' || options.placketStyle == 'facing') {
            paths.stitchingLine = new Path()
              .move(points.cbWaist)
              .line(points.cbHem)
              .attr('class', 'mark')
              .attr('data-text', 'Stitching - Line')
              .attr('data-text-class', 'center')

            points.buttonholeStart = points.cbWaist.translate(placketWidth * -0.5, buttonholeStart)
            const buttonholeDist = store.get('buttonholeDist')
            const skirtButtonholeNum = Math.floor(
              (store.get('skirtLength') - buttonholeStart * 2) / buttonholeDist
            )
            points.buttonholeEnd = points.buttonholeStart.shift(
              -90,
              buttonholeDist * skirtButtonholeNum
            )
            for (let i = 0; i <= skirtButtonholeNum; i++) {
              points['skirtButtonhole' + i] = points.buttonholeStart.shiftFractionTowards(
                points.buttonholeEnd,
                i / skirtButtonholeNum
              )
              snippets['skirtButtonhole' + i] = new Snippet(
                'buttonhole',
                points['skirtButtonhole' + i]
              ).attr('data-rotate', 90)
              snippets['skirtButton' + i] = new Snippet('button', points['skirtButtonhole' + i])
            }
          }
          if (options.placketStyle == 'inbuilt') {
            paths.foldLine = new Path()
              .move(points.cbWaist.shift(180, placketWidth))
              .line(points.cbHem.shift(180, placketWidth))
              .attr('class', 'mark')
              .attr('data-text', 'Fold - Line')
              .attr('data-text-class', 'center')
          }
        }
        if (sa) {
          let hemSa
          if (options.skirtFacings) hemSa = sa
          else {
            hemSa = sa * options.skirtHemWidth * 100
          }

          let sideSeamSa
          if (
            (options.closurePosition == 'sideLeft' || options.closurePosition == 'sideRight') &&
            !options.waistbandElastic
          ) {
            sideSeamSa = closureSa
          } else {
            sideSeamSa = sa * options.sideSeamSaWidth * 100
          }

          points.saWaistTop = points.waistTop.translate(-sa, -sa)
          points.saWaistBottom = points.waistBottom.translate(-sa, hemSa)

          if (options.skirtFacings) {
            points.saHemFacingTop = points.hemFacingTop.translate(-sa, -sa)

            paths.facingSa = paths.hemBase
              .offset(hemSa)
              .line(points.saSideBackHem)
              .join(paths.sideSeam.split(paths.facing.end())[0].offset(sideSeamSa))
              .line(points.saSideBackHemFacing)
              .join(paths.facing.reverse().offset(sa))
              .line(points.saHemFacingTop)
              .line(points.saWaistBottom)
              .close()
              .attr('class', 'interhemFacing sa')
          }

          paths.sa = paths.hemBase
            .offset(hemSa)
            .line(points.saSideBackHem)
            .join(paths.sideSeam.offset(sideSeamSa))
            .line(points.saSideWaistBack)
            .join(paths.waist.offset(sa))
            .line(points.saWaistTop)
            .line(points.saWaistBottom)
            .close()
            .attr('class', 'fabric sa')
        }
      }
    }
    //For All
    if (complete) {
      //title
      if (options.skirtPanels > 1) {
        let j
        let k
        for (let i = 0; i < options.skirtPanels - 1; i++) {
          j = String.fromCharCode(i + 98)
          k = String.fromCharCode(i + 66)
          macro('title', {
            at: points['title' + i],
            nr: '8' + j,
            title: 'Skirt Back ' + k + ' (Back)',
            prefix: 'title ' + i,
            scale: 0.15,
            rotation: 90 - points['backHemPanel' + i].angle(points['waistBackPanel' + i]),
          })

          if (options.skirtFacings) {
            macro('title', {
              at: points['titleFacing' + i],
              nr: '11' + j,
              title: 'Skirt Facing ' + k + ' (Back)',
              prefix: 'titleFacing ' + i,
              scale: 0.15,
              rotation: 90 - points['backHemPanel' + i].angle(points['waistBackPanel' + i]),
            })
            macro('title', {
              at: points.titleFacing,
              nr: '11a',
              title: 'Skirt Facing A (Back)',
              prefix: 'titleFacing',
              scale: 0.15,
            })
          }
        }
        //title
        macro('title', {
          at: points.title,
          nr: '8a',
          title: 'Skirt A (Back)',
          scale: 0.15,
          prefix: 'title',
        })
      } else {
        macro('title', {
          at: points.title,
          nr: '8',
          title: 'Skirt (Back)',
          scale: 0.5,
          prefix: 'title',
          rotation: 90 - points.backHemMid.angle(points.waistBackMid),
        })
        if (options.skirtFacings) {
          macro('title', {
            at: points.titleFacing,
            nr: '11',
            title: 'Skirt Facing (Back)',
            scale: 0.5,
            prefix: 'titleFacing',
            rotation: 90 - points.backHemMid.angle(points.backHemFacingMid),
          })
        }
      }
    }

    return part
  },
}
