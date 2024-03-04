import { skirtBase } from './skirtBase.mjs'
import { pocket } from './pocket.mjs'

export const sideFront = {
  name: 'fallon.sideFront',
  from: skirtBase,
  after: pocket,
  hide: {
    from: true,
  },
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
    //set Render
    if (options.seams == 'none' || options.seams == 'sideSeam') {
      part.hide()
      return part
    }
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
    paths.hemBase = new Path().move(points.hemL)._curve(points.hemLCp2, points.hemD).hide()

    if (options.seams == 'all') {
      paths.hemBase = paths.hemBase.split(points.hemZ)[1].hide()
    }

    paths.saRight = new Path()
      .move(points.hemD)
      .line(points.dartTipD)
      .curve(points.dartTipDCp, points.waist1RightCp1, points.waist1Right)
      .hide()

    paths.saWaistRight = new Path()
      .move(points.waist1Right)
      .curve(points.waist1RightCp2, points.waistPanel1Cp1, points.waistPanel1)
      .curve(points.waistPanel1Cp2, points.waist1LeftCp1, points.waist1Left)
      .hide()

    paths.saWaistLeft = new Path()
      .move(points.waist2Right)
      .curve(points.waist2RightCp2, points.waistPanel2Cp1, points.waistPanel2)
      .curve(points.waistPanel2Cp2, points.waist2LeftCp1, points.waist2Left)
      .hide()

    const drawWaistSeam = () => {
      if (options.seams == 'sideFront') {
        return paths.saWaistRight
          .clone()
          .curve(points.waist1LeftCp2, points.dartTipECp, points.dartTipE)
          .curve(points.dartTipECp, points.waist2RightCp1, points.waist2Right)
          .join(paths.saWaistLeft)
      } else {
        return paths.saWaistRight
      }
    }

    const drawSaLeft = () => {
      if (options.seams == 'sideFront') {
        return new Path()
          .move(points.waist2Left)
          .curve(points.waist2LeftCp2, points.dartTipFCp, points.dartTipF)
          .line(points.curveStartL)
          .curve(points.curveStartLCp2, points.hemLCp1, points.hemL)
      } else {
        return new Path()
          .move(points.waist1Left)
          .curve(points.waist1LeftCp2, points.dartTipECp, points.dartTipE)
          .line(points.hemZ)
      }
    }

    paths.seam = paths.hemBase.join(paths.saRight).join(drawWaistSeam()).join(drawSaLeft()).close()

    if (complete) {
      //grainline
      points.grainlineFrom = points.waistD.shiftFractionTowards(points.hemD, 0.025)
      points.grainlineTo = points.hemD.shiftFractionTowards(points.waistD, 0.025)
      macro('grainline', {
        from: points.waistD.rotate(90, points.grainlineFrom),
        to: points.hemD.rotate(-90, points.grainlineTo),
      })
      //notches
      if (options.pocketsBool) {
        points.pocketOpeningTop = drawSaLeft().shiftAlong(store.get('pocketOpening'))
        points.pocketOpeningBottom = drawSaLeft().shiftAlong(store.get('pocketOpeningLength'))

        macro('sprinkle', {
          snippet: 'notch',
          on: ['pocketOpeningTop', 'pocketOpeningBottom'],
        })
      }
      //title
      let titleName
      if (options.seams == 'sideFront') {
        titleName = 'Side Panel'
      } else {
        titleName = 'Side Front'
      }
      points.title = points.origin.shiftOutwards(
        points.waistPanel1,
        points.waistD.dist(points.hemD) * 0.45
      )
      macro('title', {
        nr: '2',
        title: titleName,
        at: points.title,
        rotation: 90 - points.hemD.angle(points.origin),
        scale: 0.5,
      })
      //facings
      let hemFacingSplit
      if (options.seams == 'sideFront') {
        hemFacingSplit = points.hemFacingSplitL
      } else {
        hemFacingSplit = points.hemFacingSplitZ
      }
      if (options.skirtHemFacings) {
        paths.hemFacing = new Path()
          .move(points.hemFacingL)
          .curve(points.hemFacingLCp1, points.hemFacingDCp2, points.hemFacingD)
          .split(hemFacingSplit)[1]
          .attr('class', 'interfacing')
          .attr('data-text', 'Hem Facing - Line')
          .attr('data-text-class', 'center')
      }
      //darts
      if (options.seams == 'sideFront') {
        paths.dart = new Path()
          .move(points.waist1Left)
          .line(points.dartTopE)
          .line(points.waist2Right)
          .attr('class', 'fabric help')
      }
      if (sa) {
        let sideSeamSa = sa * options.sideSeamSaWidth * 100
        if (options.closurePosition == 'sideLeft' || options.closurePosition == 'sideRight') {
          sideSeamSa = sa * options.closureSaWidth * 100
        }

        let hemSa = sa * options.skirtHemWidth * 100
        if (options.skirtHemFacings) {
          hemSa = sa
        }

        points.saHemD = points.hemD
          .shift(points.hemDCp1.angle(points.hemD), sa)
          .shift(points.dartTipD.angle(points.hemD), hemSa)

        points.saWaist1Right = points.waist1Right
          .shift(points.waist1RightCp1.angle(points.waist1Right), sa)
          .shift(points.waist1RightCp2.angle(points.waist1Right), sa)

        points.saWaist1Left = points.waist1Left
          .shift(points.waist1LeftCp1.angle(points.waist1Left), sideSeamSa)
          .shift(points.waist1LeftCp2.angle(points.waist1Left), sa)

        points.saWaist2Left = points.waist2Left
          .shift(points.waist2LeftCp2.angle(points.waist2Left), sa)
          .shift(points.waist2LeftCp1.angle(points.waist2Left), sideSeamSa)

        points.saDartTopE = utils.beamsIntersect(
          points.waist1LeftCp1
            .shiftTowards(points.waist1Left, sa)
            .rotate(-90, points.waist1LeftCp1),
          points.waist1Left.shiftTowards(points.waist1LeftCp1, sa).rotate(90, points.waist1Left),
          points.dartTipE,
          points.dartTopE
        )

        points.saHemEnd = utils.beamsIntersect(
          paths.hemBase.offset(hemSa).start(),
          paths.hemBase.offset(hemSa).shiftFractionAlong(0.005),
          drawSaLeft().offset(sideSeamSa).shiftFractionAlong(0.995),
          drawSaLeft().offset(sideSeamSa).end()
        )

        const drawWaistSa = () => {
          if (options.seams == 'sideFront') {
            return paths.saWaistRight
              .offset(sa)
              .line(points.saDartTopE)
              .join(paths.saWaistLeft.offset(sa))
              .line(points.saWaist2Left)
          } else {
            return paths.saWaistRight.offset(sa).line(points.saWaist1Left)
          }
        }
        if (options.skirtHemFacings) {
          points.saHemFacingD = points.hemFacingD
            .shift(points.hemD.angle(points.hemFacingD), sa)
            .shift(points.hemFacingDCp2.angle(points.hemFacingD), sa)

          points.saHemFacingStart = utils.beamsIntersect(
            paths.hemFacing.reverse().offset(sa).end(),
            paths.hemFacing.reverse().offset(sa).shiftFractionAlong(0.995),
            drawSaLeft().split(hemFacingSplit)[1].offset(sideSeamSa).shiftFractionAlong(0.005),
            drawSaLeft().split(hemFacingSplit)[1].offset(sideSeamSa).start()
          )

          paths.hemFacingSa = paths.hemBase
            .clone()
            .offset(hemSa)
            .line(points.saHemD)
            .line(points.saHemFacingD)
            .join(paths.hemFacing.reverse().offset(sa))
            .line(points.saHemFacingStart)
            .join(drawSaLeft().split(hemFacingSplit)[1].offset(sideSeamSa))
            .line(points.saHemEnd)
            .close()
            .attr('class', 'interfacing sa')
        }
        paths.sa = paths.hemBase
          .clone()
          .offset(hemSa)
          .line(points.saHemD)
          .join(paths.saRight.offset(sa))
          .line(points.saWaist1Right)
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
