import { skirtBase } from './skirtBase.mjs'
import { pocket } from './pocket.mjs'

export const sideBack = {
  name: 'fallon.sideBack',
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
    if (options.seams == 'none' || options.seams == 'sideFront') {
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
    paths.hemBase = new Path()
      .move(points.hemL)
      ._curve(points.hemLCp2, points.hemD)
      .split(points.hemZ)[0]
      .hide()

    paths.saRight = new Path()
      .move(points.hemZ)
      .line(points.dartTipE)
      .curve(points.dartTipECp, points.waist2RightCp1, points.waist2Right)
      .hide()

    paths.saWaist = new Path()
      .move(points.waist2Right)
      .curve(points.waist2RightCp2, points.waistPanel2Cp1, points.waistPanel2)
      .curve(points.waistPanel2Cp2, points.waist2LeftCp1, points.waist2Left)
      .hide()

    paths.saLeft = new Path()
      .move(points.waist2Left)
      .curve(points.waist2LeftCp2, points.dartTipFCp, points.dartTipF)
      .line(points.curveStartL)
      .curve(points.curveStartLCp2, points.hemLCp1, points.hemL)
      .hide()

    paths.seam = paths.hemBase.join(paths.saRight).join(paths.saWaist).join(paths.saLeft).close()

    if (complete) {
      //grainline
      points.grainlineFrom = points.waistE.shiftFractionTowards(points.hemE, 0.025)
      points.grainlineTo = points.hemE.shiftFractionTowards(points.waistE, 0.025)
      macro('grainline', {
        from: points.waistE.rotate(90, points.grainlineFrom),
        to: points.hemE.rotate(-90, points.grainlineTo),
      })
      //notches
      if (options.pocketsBool) {
        points.pocketOpeningTop = paths.saRight.reverse().shiftAlong(store.get('pocketOpening'))
        points.pocketOpeningBottom = paths.saRight
          .reverse()
          .shiftAlong(store.get('pocketOpeningLength'))
        macro('sprinkle', {
          snippet: 'notch',
          on: ['pocketOpeningTop', 'pocketOpeningBottom'],
        })
      }
      //title
      points.title = points.origin.shiftOutwards(
        points.waistPanel2,
        points.waistE.dist(points.hemE) * 0.45
      )
      macro('title', {
        nr: '3',
        title: 'Side Back',
        at: points.title,
        rotation: 90 - points.hemE.angle(points.origin),
        cutNr: 2,
        scale: 0.5,
      })
      //facings
      if (options.skirtHemFacings) {
        paths.hemFacing = new Path()
          .move(points.hemFacingL)
          .curve(points.hemFacingLCp1, points.hemFacingDCp2, points.hemFacingD)
          .curve(points.hemFacingDCp1, points.cfHemFacingCp2, points.cfHemFacing)
          .split(points.hemFacingSplitZ)[0]
          .split(points.hemFacingSplitL)[1]
          .attr('class', 'interfacing')
          .attr('data-text', 'Hem Facing - Line')
          .attr('data-text-class', 'center')
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

        points.saHemZ = utils.beamsIntersect(
          points.hemZ.shiftTowards(points.dartTipE, sideSeamSa).rotate(-90, points.hemZ),
          points.dartTipE.shiftTowards(points.hemZ, sideSeamSa).rotate(90, points.dartTipE),
          paths.hemBase.offset(hemSa).shiftFractionAlong(0.995),
          paths.hemBase.offset(hemSa).end()
        )

        points.saWaist2Right = points.waist2Right
          .shift(points.waist2RightCp2.angle(points.waist2Right), sideSeamSa)
          .shift(points.waist2RightCp1.angle(points.waist2Right), sa)

        points.saWaist2Left = points.waist2Left
          .shift(points.waist2LeftCp2.angle(points.waist2Left), sa)
          .shift(points.waist2LeftCp1.angle(points.waist2Left), sa)

        points.saHemL = points.hemL
          .shift(points.hemLCp2.angle(points.hemL), sa)
          .shift(points.hemLCp1.angle(points.hemL), hemSa)

        if (options.skirtHemFacings) {
          points.saHemFacingSplitZ = utils.beamsIntersect(
            points.hemZ.shiftTowards(points.dartTipE, sideSeamSa).rotate(-90, points.hemZ),
            points.dartTipE.shiftTowards(points.hemZ, sideSeamSa).rotate(90, points.dartTipE),
            paths.hemFacing.reverse().offset(sa).start(),
            paths.hemFacing.reverse().offset(sa).shiftFractionAlong(0.005)
          )

          points.saHemFacingStart = utils.beamsIntersect(
            paths.hemFacing.reverse().offset(sa).end(),
            paths.hemFacing.reverse().offset(sa).shiftFractionAlong(0.995),
            paths.saLeft.split(points.hemFacingSplitL)[1].offset(sa).shiftFractionAlong(0.005),
            paths.saLeft.split(points.hemFacingSplitL)[1].offset(sa).start()
          )

          paths.hemFacingSa = paths.hemBase
            .clone()
            .offset(hemSa)
            .line(points.saHemZ)
            .line(points.saHemFacingSplitZ)
            .join(paths.hemFacing.reverse().offset(sa))
            .line(points.saHemFacingStart)
            .join(paths.saLeft.split(points.hemFacingSplitL)[1].offset(sa))
            .line(points.saHemL)
            .close()
            .attr('class', 'interfacing sa')
        }

        paths.sa = paths.hemBase
          .clone()
          .offset(hemSa)
          .line(points.saHemZ)
          .join(paths.saRight.offset(sideSeamSa))
          .line(points.saWaist2Right)
          .join(paths.saWaist.offset(sa))
          .line(points.saWaist2Left)
          .join(paths.saLeft.offset(sa))
          .line(points.saHemL)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
