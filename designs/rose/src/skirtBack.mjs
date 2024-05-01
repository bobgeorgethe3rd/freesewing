import { skirtBack as skirtBackClaude } from '@freesewing/claude'
import { pocket } from './pocket.mjs'

export const skirtBack = {
  name: 'rose.skirtBack',
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
      absoluteOptions,
    } = sh
    //draft
    if (!options.skirtBool) {
      part.hide()
      return part
    } else {
      skirtBackClaude.draft(sh)
    }
    //remove macros
    macro('logorg', false)
    macro('scalebox', false)
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

          if (hemSa < sa && options.placketStyle != 'separate') {
            points.saWaistBottom = points.waistBottom.translate(-sa, sa)
          }
          points.saCbHem = new Point(points.cbHem.x, points.saWaistBottom.y)

          const drawHemSa = () => {
            if (options.placketStyle == 'separate') {
              return paths.hemBase.offset(hemSa)
            } else {
              return new Path()
                .move(points.saWaistBottom)
                .line(points.saCbHem)
                .join(paths.hemBase.split(points.cbHem)[1].offset(hemSa))
            }
          }

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

          paths.sa = drawHemSa()
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
    if (complete) {
      //title
      if (options.skirtPanels <= 1) {
        macro('title', {
          at: points.title,
          nr: '5',
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
      } else {
        macro('title', {
          at: points.title,
          nr: '5a',
          title: 'Skirt A (Back)',
          scale: 0.15,
          prefix: 'title',
        })
        if (options.skirtFacings) {
          macro('title', {
            at: points.titleFacing,
            nr: '11a',
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
