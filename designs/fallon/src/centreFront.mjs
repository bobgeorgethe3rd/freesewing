import { skirtBase } from './skirtBase.mjs'
import { pocket } from './pocket.mjs'
import { pluginLogoRG } from '@freesewing/plugin-logorg'

export const centreFront = {
  name: 'fallon.centreFront',
  from: skirtBase,
  after: pocket,
  hide: {
    from: true,
  },
  plugins: [pluginLogoRG],
  draft: ({
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
  }) => {
    //removing paths
    if (options.wandaGuides) {
      const keepThese = ['wandaGuide']
      for (const name in paths) {
        if (keepThese.indexOf(name) === -1) delete paths[name]
      }
    } else {
      for (let i in paths) delete paths[i]
    }
    //let's begin
    //paths
    paths.hemBase = new Path()
      .move(points.hemL)
      ._curve(points.hemLCp2, points.hemD)
      .curve(points.hemDCp2, points.cfHemCp1, points.cfHem)
      .hide()

    const drawHemBase = () => {
      if (options.seams != 'none') {
        if (options.seams == 'all' || options.seams == 'sideFront') {
          return paths.hemBase.split(points.hemD)[1].hide()
        } else {
          return paths.hemBase.split(points.hemZ)[1].hide()
        }
      } else {
        return paths.hemBase
      }
    }

    paths.cfWaist = new Path()
      .move(points.cfWaist)
      .curve(points.cfWaistCp2, points.waistPanel0Cp1, points.waistPanel0)
      .curve(points.waistPanel0Cp2, points.waist0LeftCp1, points.waist0Left)
      .hide()

    paths.sideWaistFront = new Path()
      .move(points.waist1Right)
      .curve(points.waist1RightCp2, points.waistPanel1Cp1, points.waistPanel1)
      .curve(points.waistPanel1Cp2, points.waist1LeftCp1, points.waist1Left)
      .hide()

    paths.sideWaistBack = new Path()
      .move(points.waist2Right)
      .curve(points.waist2RightCp2, points.waistPanel2Cp1, points.waistPanel2)
      .curve(points.waistPanel2Cp2, points.waist2LeftCp1, points.waist2Left)
      .hide()

    const drawWaistSeam = () => {
      if (options.seams != 'none') {
        if (options.seams == 'all' || options.seams == 'sideFront') {
          return paths.cfWaist
        } else {
          return paths.cfWaist
            .clone()
            .curve(points.waist0LeftCp2, points.dartTipDCp, points.dartTipD)
            .curve(points.dartTipDCp, points.waist1RightCp1, points.waist1Right)
            .join(paths.sideWaistFront)
        }
      } else {
        return paths.cfWaist
          .clone()
          .curve(points.waist0LeftCp2, points.dartTipDCp, points.dartTipD)
          .curve(points.dartTipDCp, points.waist1RightCp1, points.waist1Right)
          .join(paths.sideWaistFront)
          .curve(points.waist1LeftCp2, points.dartTipECp, points.dartTipE)
          .curve(points.dartTipECp, points.waist2RightCp1, points.waist2Right)
          .join(paths.sideWaistBack)
      }
    }

    const drawSaLeft = () => {
      if (options.seams != 'none') {
        if (options.seams == 'all' || options.seams == 'sideFront') {
          return new Path()
            .move(points.waist0Left)
            .curve(points.waist0LeftCp2, points.dartTipDCp, points.dartTipD)
            .line(points.hemD)
        } else {
          return new Path()
            .move(points.waist1Left)
            .curve(points.waist1LeftCp2, points.dartTipECp, points.dartTipE)
            .line(points.hemZ)
        }
      } else {
        return new Path()
          .move(points.waist2Left)
          .curve(points.waist2LeftCp2, points.dartTipFCp, points.dartTipF)
          .line(points.curveStartL)
          .curve(points.curveStartLCp2, points.hemLCp1, points.hemL)
      }
    }

    paths.seam = drawHemBase()
      .clone()
      .line(points.cfWaist)
      .join(drawWaistSeam())
      .join(drawSaLeft())
      .close()

    if (complete) {
      //grainline
      let titleCutNum
      if (options.closurePosition != 'front' && options.cfSaWidth == 0) {
        points.cutOnFoldFrom = points.cfHem
        points.cutOnFoldTo = points.cfWaist
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
        titleCutNum = 1
      } else {
        points.grainlineFrom = points.cfWaist.shiftFractionTowards(points.cfWaistCp2, 0.9)
        points.grainlineTo = new Point(points.grainlineFrom.x, points.cfHem.y)
        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
        titleCutNum = 2
      }
      //notches
      if (options.pocketsBool && (options.seams == 'none' || options.seams == 'sideSeam')) {
        points.pocketOpeningTop = drawSaLeft().shiftAlong(store.get('pocketOpening'))

        points.pocketOpeningBottom = drawSaLeft().shiftAlong(store.get('pocketOpeningLength'))
        macro('sprinkle', {
          snippet: 'notch',
          on: ['pocketOpeningTop', 'pocketOpeningBottom'],
        })
      }
      //title
      let titleName
      if (options.seams == 'all' || options.seams == 'sideFront') {
        titleName = 'Centre Front'
      } else {
        titleName = 'Front'
      }
      points.title = new Point(
        points.waist0Left.x * 1.05,
        points.cfWaist.y + points.cfWaist.dy(points.cfHem) * 0.2
      )
      macro('title', {
        nr: '1',
        title: titleName,
        at: points.title,
        cutNr: titleCutNum,
        scale: 0.5,
      })
      //logo
      points.logo = new Point(
        points.waist0LeftCp1.x,
        points.cfWaist.y + points.cfWaist.dy(points.cfHem) * 0.4
      )
      macro('logorg', {
        at: points.logo,
        scale: 0.5,
      })
      //scalebox
      points.scalebox = new Point(
        points.waist0LeftCp1.x,
        points.cfWaist.y + points.cfWaist.dy(points.cfHem) * 0.6
      )
      macro('scalebox', {
        at: points.scalebox,
      })
      //facings
      let hemFacingSplit
      if (options.seams != 'none') {
        if (options.seams == 'all' || options.seams == 'sideFront') {
          hemFacingSplit = points.hemFacingD
        } else {
          hemFacingSplit = points.hemFacingSplitZ
        }
      } else {
        hemFacingSplit = points.hemFacingSplitL
      }
      if (options.skirtHemFacings) {
        paths.hemFacing = new Path()
          .move(points.hemFacingL)
          .curve(points.hemFacingLCp1, points.hemFacingDCp2, points.hemFacingD)
          .curve(points.hemFacingDCp1, points.cfHemFacingCp2, points.cfHemFacing)
          .split(hemFacingSplit)[1]
          .attr('class', 'interfacing')
          .attr('data-text', 'Hem Facing - Line')
          .attr('data-text-class', 'center')
      }
      //darts and seams
      if (options.seams == 'none' || options.seams == 'sideSeam') {
        if (options.seams == 'none') {
          paths.sideDart = new Path()
            .move(points.waist1Left)
            .line(points.dartTopE)
            .line(points.waist2Right)
            .attr('class', 'fabric help')
        }
        paths.frontDart = new Path()
          .move(points.waist0Left)
          .line(points.dartTopD)
          .line(points.waist1Right)
          .attr('class', 'fabric help')
      }

      if (sa) {
        const closureSa = sa * options.closureSaWidth * 100

        let cfSa = sa * options.cfSaWidth * 100
        if (options.closurePosition == 'front') {
          cfSa = closureSa
        }

        let sideSeamSa = sa
        if (options.seams == 'sideSeam' || options.seams == 'none') {
          if (options.closurePosition == 'sideLeft' || options.closurePosition == 'sideRight') {
            sideSeamSa = closureSa
          } else {
            sideSeamSa = sa * options.sideSeamSaWidth * 100
          }
        }

        let hemSa = sa * options.skirtHemWidth * 100
        if (options.skirtHemFacings) {
          hemSa = sa
        }

        points.saCfHem = points.cfHem.translate(cfSa, hemSa)
        points.saCfWaist = points.cfWaist.translate(cfSa, -sa)

        points.saWaist0Left = points.waist0Left
          .shift(points.waist0LeftCp2.angle(points.waist0Left), sa)
          .shift(points.waist0LeftCp1.angle(points.waist0Left), sideSeamSa)

        points.saDartTopD = utils.beamsIntersect(
          points.waist0LeftCp1
            .shiftTowards(points.waist0Left, sa)
            .rotate(-90, points.waist0LeftCp1),
          points.waist0Left.shiftTowards(points.waist0LeftCp1, sa).rotate(90, points.waist0Left),
          points.dartTipD,
          points.dartTopD
        )

        points.saDartTopE = utils.beamsIntersect(
          points.waist1LeftCp1
            .shiftTowards(points.waist1Left, sa)
            .rotate(-90, points.waist1LeftCp1),
          points.waist1Left.shiftTowards(points.waist1LeftCp1, sa).rotate(90, points.waist1Left),
          points.dartTipE,
          points.dartTopE
        )

        points.saWaist1Left = points.waist1Left
          .shift(points.waist1LeftCp2.angle(points.waist1Left), sa)
          .shift(points.waist1LeftCp1.angle(points.waist1Left), sideSeamSa)

        points.saWaist2Left = points.waist2Left
          .shift(points.waist2LeftCp2.angle(points.waist2Left), sa)
          .shift(points.waist2LeftCp1.angle(points.waist2Left), sideSeamSa)

        points.saHemEnd = utils.beamsIntersect(
          drawHemBase().offset(hemSa).start(),
          drawHemBase().offset(hemSa).shiftFractionAlong(0.005),
          drawSaLeft().offset(sideSeamSa).shiftFractionAlong(0.995),
          drawSaLeft().offset(sideSeamSa).end()
        )

        const drawWaistSa = () => {
          if (options.seams != 'none') {
            if (options.seams == 'all' || options.seams == 'sideFront') {
              return paths.cfWaist.offset(sa).line(points.saWaist0Left)
            } else {
              return paths.cfWaist
                .offset(sa)
                .line(points.saDartTopD)
                .join(paths.sideWaistFront.offset(sa))
                .line(points.saWaist1Left)
            }
          } else {
            return paths.cfWaist
              .offset(sa)
              .line(points.saDartTopD)
              .join(paths.sideWaistFront.offset(sa))
              .line(points.saDartTopE)
              .join(paths.sideWaistBack.offset(sa))
              .line(points.saWaist2Left)
          }
        }
        if (options.skirtHemFacings) {
          points.saCfHemFacing = points.cfHemFacing.translate(cfSa, -sa)
          points.saHemFacingStart = utils.beamsIntersect(
            paths.hemFacing.reverse().offset(sa).end(),
            paths.hemFacing.reverse().offset(sa).shiftFractionAlong(0.995),
            drawSaLeft().split(hemFacingSplit)[1].offset(sideSeamSa).shiftFractionAlong(0.005),
            drawSaLeft().split(hemFacingSplit)[1].offset(sideSeamSa).start()
          )
          paths.hemFacingSa = drawHemBase()
            .offset(hemSa)
            .line(points.saCfHem)
            .line(points.saCfHemFacing)
            .join(paths.hemFacing.reverse().offset(sa))
            .line(points.saHemFacingStart)
            .join(drawSaLeft().split(hemFacingSplit)[1].offset(sideSeamSa))
            .line(points.saHemEnd)
            .close()
            .attr('class', 'interfacing sa')
        }
        paths.sa = drawHemBase()
          .offset(hemSa)
          .line(points.saCfHem)
          .line(points.saCfWaist)
          .join(drawWaistSa())
          .join(drawSaLeft().offset(sideSeamSa))
          .line(points.saHemEnd)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
