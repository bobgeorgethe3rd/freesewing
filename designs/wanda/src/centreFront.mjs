import { skirtBase } from './skirtBase.mjs'
import { pocket } from './pocket.mjs'
import { pluginLogoRG } from '@freesewing/plugin-logorg'

export const centreFront = {
  name: 'wanda.centreFront',
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
    const drawHemBase = () => {
      if (options.frontDart == 'dart') {
        return new Path()
          .move(points.hemE)
          .curve(points.hemECp2, points.hemDCp1, points.hemD)
          .curve(points.hemDCp2, points.cfHemCp1, points.cfHem)
      } else {
        return new Path().move(points.hemD).curve(points.hemDCp2, points.cfHemCp1, points.cfHem)
      }
    }

    const drawSeam = () => {
      if (options.frontDart == 'dart') {
        return new Path()
          .move(points.cfHem)
          .line(points.cfWaist)
          .curve(points.cfWaistCp2, points.waistPanel0Cp1, points.waistPanel0)
          .curve(points.waistPanel0Cp2, points.waist0LeftCp1, points.waist0Left)
          .curve(points.waist0LeftCp2, points.dartTipDCp, points.dartTipD)
          .curve(points.dartTipDCp, points.waist1RightCp1, points.waist1Right)
          .curve(points.waist1RightCp2, points.waistPanel1Cp1, points.waistPanel1)
          .curve(points.waistPanel1Cp2, points.waist1LeftCp1, points.waist1Left)
          .curve(points.waist1LeftCp2, points.dartTipECp, points.dartTipE)
          .line(points.hemE)
      } else {
        return new Path()
          .move(points.cfHem)
          .line(points.cfWaist)
          .curve(points.cfWaistCp2, points.waistPanel0Cp1, points.waistPanel0)
          .curve(points.waistPanel0Cp2, points.waist0LeftCp1, points.waist0Left)
          .curve(points.waist0LeftCp2, points.dartTipDCp, points.dartTipD)
          .line(points.hemD)
      }
    }

    //paths
    paths.seam = drawHemBase().join(drawSeam()).close()

    if (complete) {
      //grainline
      if (options.closurePosition != 'front' && options.cfSaWidth == 0) {
        points.cutOnFoldFrom = points.cfHem
        points.cutOnFoldTo = points.cfWaist
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
      } else {
        points.grainlineFrom = points.cfWaist.shiftFractionTowards(points.cfWaistCp2, 0.9)
        points.grainlineTo = new Point(points.grainlineFrom.x, points.cfHem.y)
        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
      }
      //notches & dart
      let titleNum
      if (options.frontDart == 'dart') {
        if (options.pocketsBool) {
          paths.sideSeam = new Path()
            .move(points.waist1Left)
            .curve(points.waist1LeftCp2, points.dartTipECp, points.dartTipE)
            .line(points.hemE)
            .hide()
          points.pocketOpeningTop = paths.sideSeam.shiftAlong(store.get('pocketOpening'))
          points.pocketOpeningBottom = paths.sideSeam.shiftAlong(store.get('pocketOpeningLength'))

          macro('sprinkle', {
            snippet: 'notch',
            on: ['pocketOpeningTop', 'pocketOpeningBottom'],
          })
        }

        paths.dart = new Path()
          .move(points.waist0Left)
          .line(points.dartTopD)
          .line(points.waist1Right)
          .attr('class', 'fabric help')
        titleNum = 1
      } else titleNum = '1a'
      //title
      points.title = new Point(
        points.waist0Left.x * 1.05,
        points.cfWaist.y + points.cfWaist.dy(points.cfHem) * 0.2
      )
      macro('title', {
        nr: titleNum,
        title: 'Centre Front',
        at: points.title,
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
      const drawHemFacing = () => {
        if (options.frontDart == 'dart') {
          return new Path()
            .move(points.hemFacingE)
            .curve(points.hemFacingECp1, points.hemFacingDCp2, points.hemFacingD)
            .curve(points.hemFacingDCp1, points.cfHemFacingCp2, points.cfHemFacing)
        } else {
          return new Path()
            .move(points.hemFacingD)
            .curve(points.hemFacingDCp1, points.cfHemFacingCp2, points.cfHemFacing)
        }
      }

      if (options.skirtHemFacings) {
        points.cfHemFacing = points.cfHem.shiftTowards(
          points.cfWaist,
          store.get('skirtHemFacingWidth')
        )
        points.hemFacingDCp1 = utils.beamsIntersect(
          points.hemDCp2,
          points.origin,
          points.hemFacingD,
          points.origin.rotate(-90, points.hemFacingD)
        )
        points.cfHemFacingCp2 = utils.beamsIntersect(
          points.cfHemCp1,
          points.origin,
          points.cfHemFacing,
          points.origin.rotate(90, points.cfHemFacing)
        )
        paths.hemFacing = drawHemFacing()
          .attr('class', 'interfacing')
          .attr('data-text', 'Hem Facing - Line')
          .attr('data-text-class', 'center')
      }

      if (sa) {
        const closureSa = sa * options.closureSaWidth * 100

        let cfSa = sa * options.cfSaWidth * 100
        if (options.closurePosition == 'front') {
          cfSa = closureSa
        }

        let sideSeamSa = sa * options.sideSeamSaWidth * 100
        if (options.closurePosition == 'sideLeft' || options.closurePosition == 'sideRight') {
          sideSeamSa = closureSa
        }

        let hemSa = sa * options.skirtHemWidth * 100
        if (options.skirtHemFacings) {
          hemSa = sa
        }

        points.saCfHem = points.cfHem.translate(cfSa, hemSa)
        points.saCfWaist = points.cfWaist.translate(cfSa, -sa)
        points.saWaist1Left = points.waist1Left
          .shift(points.waist1LeftCp2.angle(points.waist1Left), sa)
          .shift(points.waist1LeftCp1.angle(points.waist1Left), sideSeamSa)

        points.saHemE = points.hemE
          .shift(points.dartTipE.angle(points.hemE), hemSa)
          .shift(points.hemECp2.angle(points.hemE), sideSeamSa)

        points.saDartTopD = utils.beamsIntersect(
          points.waist0LeftCp1
            .shiftTowards(points.waist0Left, sa)
            .rotate(-90, points.waist0LeftCp1),
          points.waist0Left.shiftTowards(points.waist0LeftCp1, sa).rotate(90, points.waist0Left),
          points.dartTipD,
          points.dartTopD
        )

        points.saWaist0Left = points.waist0Left
          .shift(points.waist0LeftCp1.angle(points.waist0Left), sa)
          .shift(points.waist0LeftCp2.angle(points.waist0Left), sa)

        points.saHemD = points.hemD
          .shift(points.dartTipD.angle(points.hemD), hemSa)
          .shift(points.hemDCp2.angle(points.hemD), sa)

        const drawSaBase = () => {
          if (options.frontDart == 'dart') {
            return new Path()
              .move(points.cfWaist)
              .curve(points.cfWaistCp2, points.waistPanel0Cp1, points.waistPanel0)
              .curve(points.waistPanel0Cp2, points.waist0LeftCp1, points.waist0Left)
              .offset(sa)
              .line(points.saDartTopD)
              .join(
                new Path()
                  .move(points.waist1Right)
                  .curve(points.waist1RightCp2, points.waistPanel1Cp1, points.waistPanel1)
                  .curve(points.waistPanel1Cp2, points.waist1LeftCp1, points.waist1Left)
                  .offset(sa)
              )
              .line(points.saWaist1Left)
              .join(
                new Path()
                  .move(points.waist1Left)
                  .curve(points.waist1LeftCp2, points.dartTipECp, points.dartTipE)
                  .line(points.hemE)
                  .offset(sideSeamSa)
              )
              .line(points.saHemE)
          } else {
            return new Path()
              .move(points.cfWaist)
              .curve(points.cfWaistCp2, points.waistPanel0Cp1, points.waistPanel0)
              .curve(points.waistPanel0Cp2, points.waist0LeftCp1, points.waist0Left)
              .offset(sa)
              .line(points.saWaist0Left)
              .join(
                new Path()
                  .move(points.waist0Left)
                  .curve(points.waist0LeftCp2, points.dartTipDCp, points.dartTipD)
                  .line(points.hemD)
                  .offset(sa)
              )
              .line(points.saHemD)
          }
        }

        if (options.skirtHemFacings) {
          points.saCfHemFacing = new Point(points.saCfHem.x, points.cfHemFacing.y - sa)
          points.saHemFacingD = points.hemFacingD
            .shift(points.hemD.angle(points.hemFacingD), sa)
            .shift(points.hemFacingDCp1.angle(points.hemFacingD), sa)
          points.saHemFacingE = points.hemFacingE
            .shift(points.hemE.angle(points.hemFacingE), sa)
            .shift(points.hemFacingECp1.angle(points.hemFacingE), sideSeamSa)

          let saHemFacing = points.saHemFacingD
          let saHemEnd = points.saHemD
          if (options.frontDart == 'dart') {
            saHemFacing = points.saHemFacingE
            saHemEnd = points.saHemE
          }

          paths.hemFacingSa = drawHemBase()
            .offset(hemSa)
            .line(points.saCfHem)
            .line(points.saCfHemFacing)
            .join(drawHemFacing().reverse().offset(sa))
            .line(saHemFacing)
            .line(saHemEnd)
            .attr('class', 'interfacing sa')
        }

        paths.sa = drawHemBase()
          .offset(hemSa)
          .line(points.saCfHem)
          .line(points.saCfWaist)
          .join(drawSaBase())
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
