import { front as frontJackson } from '@freesewing/jackson'
import { pluginLogoRG } from '@freesewing/plugin-logorg'
import { pctBasedOn } from '@freesewing/core'
import { back } from './back.mjs'

export const front = {
  name: 'jack.front',
  from: frontJackson,
  after: back,
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
    log,
    absoluteOptions,
  }) => {
    //remove macros
    macro('title', false)
    delete paths.grainline
    //measures
    const legBandWidth = store.get('legBandWidth')
    //draw paths
    const drawOutseam = () => {
      if (options.fitKnee) {
        if (options.fitCalf) {
          if (points.seatOutAnchor.x < points.seatOut.x)
            return new Path()
              .move(points.waistOut)
              .curve(points.seatOut, points.kneeOutCp1, points.kneeOut)
              .curve(points.kneeOutCp2, points.calfOutCp1, points.calfOut)
              .curve(points.calfOutCp2, points.floorOutCp1, points.floorOut)
          else
            return new Path()
              .move(points.waistOut)
              ._curve(points.seatOutCp1, points.seatOut)
              .curve(points.seatOutCp2, points.kneeOutCp1, points.kneeOut)
              .curve(points.kneeOutCp2, points.calfOutCp1, points.calfOut)
              .curve(points.calfOutCp2, points.floorOutCp1, points.floorOut)
        } else {
          if (points.seatOutAnchor.x < points.seatOut.x)
            return new Path()
              .move(points.waistOut)
              .curve(points.seatOut, points.kneeOutCp1, points.kneeOut)
              .curve(points.kneeOutCp2, points.floorOutCp1, points.floorOut)
          else
            return new Path()
              .move(points.waistOut)
              ._curve(points.seatOutCp1, points.seatOut)
              .curve(points.seatOutCp2, points.kneeOutCp1, points.kneeOut)
              .curve(points.kneeOutCp2, points.floorOutCp1, points.floorOut)
        }
      } else {
        if (options.fitCalf) {
          if (points.seatOutAnchor.x < points.seatOut.x)
            return new Path()
              .move(points.waistOut)
              .curve(points.seatOut, points.calfOutCp1, points.calfOut)
              .curve(points.calfOutCp2, points.floorOutCp1, points.floorOut)
          else
            return new Path()
              .move(points.waistOut)
              ._curve(points.seatOutCp1, points.seatOut)
              .curve(points.seatOutCp2, points.calfOutCp1, points.calfOut)
              .curve(points.calfOutCp2, points.floorOutCp1, points.floorOut)
        } else {
          if (points.seatOutAnchor.x < points.seatOut.x)
            return new Path()
              .move(points.waistOut)
              .curve(points.seatOut, points.floorOutCp1, points.floorOut)
          else
            return new Path()
              .move(points.waistOut)
              ._curve(points.seatOutCp1, points.seatOut)
              .curve(points.seatOutCp2, points.floorOutCp1, points.floorOut)
        }
      }
    }
    const drawInseam = () => {
      if (options.fitKnee) {
        if (options.fitCalf) {
          return new Path()
            .move(points.floorIn)
            .curve(points.floorInCp2, points.calfInCp1, points.calfIn)
            .curve(points.calfInCp2, points.kneeInCp1, points.kneeIn)
            .curve(points.kneeInCp2, points.upperLegInCp1, points.upperLegIn)
        } else {
          return new Path()
            .move(points.floorIn)
            .curve(points.floorInCp2, points.kneeInCp1, points.kneeIn)
            .curve(points.kneeInCp2, points.upperLegInCp1, points.upperLegIn)
        }
      } else {
        if (options.fitCalf) {
          return new Path()
            .move(points.floorIn)
            .curve(points.floorInCp2, points.calfInCp1, points.calfIn)
            .curve(points.calfInCp2, points.upperLegInCp1, points.upperLegIn)
        } else {
          return new Path()
            .move(points.floorIn)
            .curve(points.floorInCp2, points.upperLegInCp1, points.upperLegIn)
        }
      }
    }
    //let's begin
    points.bottomMin = points.upperLeg.shiftFractionTowards(points.knee, 0.1)
    if (points.upperLeg.dist(points.bottomMin) < legBandWidth) {
      points.bottomMin = points.upperLeg
        .shiftTowards(points.knee, legBandWidth)
        .shiftFractionTowards(points.knee, 0.1)
    }
    if (options.legLength < 0.5) {
      points.bottom = points.bottomMin.shiftFractionTowards(points.knee, 2 * options.legLength)
    } else {
      points.bottom = points.knee.shiftFractionTowards(points.floor, 2 * options.legLength - 1)
    }
    points.split = points.bottom.shiftTowards(points.upperLeg, legBandWidth)
    points.splitOut = drawOutseam().intersects(
      new Path().move(points.split).line(points.split.shift(180, measurements.waistToFloor * 10))
    )[0]
    points.splitIn = drawInseam().intersects(
      new Path().move(points.split).line(points.split.shift(0, measurements.waistToFloor * 10))
    )[0]

    if (options.legLength < 1) {
      if (options.legLength == 0.5 && options.fitKnee) {
        points.bottomOut = points.kneeOut
        points.bottomIn = points.kneeIn
      } else {
        points.bottomOut = drawOutseam().intersects(
          new Path()
            .move(points.bottom)
            .line(points.bottom.shift(180, measurements.waistToFloor * 10))
        )[0]
        points.bottomIn = drawInseam().intersects(
          new Path()
            .move(points.bottom)
            .line(points.bottom.shift(0, measurements.waistToFloor * 10))
        )[0]
      }
      paths.outSeam = drawOutseam().split(points.bottomOut)[0].hide()
      paths.inseam = drawInseam().split(points.bottomIn)[1].hide()
    } else {
      paths.outSeam = drawOutseam().hide()
      paths.inseam = drawInseam().hide()
      points.bottomOut = points.floorOut
      points.bottomIn = points.floorIn
    }

    macro('mirror', {
      mirror: [points.bottomIn, points.bottomOut],
      points: ['splitIn', 'splitOut'],
      paths: ['inseam', 'outSeam'],
      prefix: 'm',
    })

    paths.outSeam0 = paths.mOutSeam.reverse().split(points.mSplitOut)[0].hide()
    paths.inseam1 = paths.mInseam.reverse().split(points.mSplitIn)[1].hide()

    //because of limitations of macro mirror I have had to do this instead

    const shift = [
      'waistOut',
      'seatOutCp1',
      'seatOut',
      'seatOutCp2',
      'kneeOutCp1',
      'kneeOut',
      'kneeOutCp2',
      'calfOutCp1',
      'calfOut',
      'calfOutCp2',
      'floorOutCp1',
      'floorOut',
      'floorIn',
      'floorInCp2',
      'calfInCp1',
      'calfIn',
      'calfInCp2',
      'kneeInCp1',
      'kneeIn',
      'kneeInCp2',
      'upperLegInCp1',
      'upperLegIn',
    ]
    for (const p of shift)
      points['s' + utils.capitalize(p)] = points[p].shift(-90, legBandWidth * 2)

    const drawShiftOutseam = () => {
      if (options.fitKnee) {
        if (options.fitCalf) {
          if (points.seatOutAnchor.x < points.seatOut.x)
            return new Path()
              .move(points.sWaistOut)
              .curve(points.sSeatOut, points.sKneeOutCp1, points.sKneeOut)
              .curve(points.sKneeOutCp2, points.sCalfOutCp1, points.sCalfOut)
              .curve(points.sCalfOutCp2, points.sFloorOutCp1, points.sFloorOut)
          else
            return new Path()
              .move(points.sWaistOut)
              ._curve(points.sSeatOutCp1, points.sSeatOut)
              .curve(points.sSeatOutCp2, points.sKneeOutCp1, points.sKneeOut)
              .curve(points.sKneeOutCp2, points.sCalfOutCp1, points.sCalfOut)
              .curve(points.sCalfOutCp2, points.sFloorOutCp1, points.sFloorOut)
        } else {
          if (points.seatOutAnchor.x < points.seatOut.x)
            return new Path()
              .move(points.sWaistOut)
              .curve(points.sSeatOut, points.sKneeOutCp1, points.sKneeOut)
              .curve(points.sKneeOutCp2, points.sFloorOutCp1, points.sFloorOut)
          else
            return new Path()
              .move(points.sWaistOut)
              ._curve(points.sSeatOutCp1, points.sSeatOut)
              .curve(points.sSeatOutCp2, points.sKneeOutCp1, points.sKneeOut)
              .curve(points.sKneeOutCp2, points.sFloorOutCp1, points.sFloorOut)
        }
      } else {
        if (options.fitCalf) {
          if (points.seatOutAnchor.x < points.seatOut.x)
            return new Path()
              .move(points.sWaistOut)
              .curve(points.sSeatOut, points.sCalfOutCp1, points.sCalfOut)
              .curve(points.sCalfOutCp2, points.sFloorOutCp1, points.sFloorOut)
          else
            return new Path()
              .move(points.sWaistOut)
              ._curve(points.sSeatOutCp1, points.sSeatOut)
              .curve(points.sSeatOutCp2, points.sCalfOutCp1, points.sCalfOut)
              .curve(points.sCalfOutCp2, points.sFloorOutCp1, points.sFloorOut)
        } else {
          if (points.seatOutAnchor.x < points.seatOut.x)
            return new Path()
              .move(points.sWaistOut)
              .curve(points.sSeatOut, points.sFloorOutCp1, points.sFloorOut)
          else
            return new Path()
              .move(points.sWaistOut)
              ._curve(points.sSeatOutCp1, points.sSeatOut)
              .curve(points.sSeatOutCp2, points.sFloorOutCp1, points.sFloorOut)
        }
      }
    }
    const drawShiftInseam = () => {
      if (options.fitKnee) {
        if (options.fitCalf) {
          return new Path()
            .move(points.sFloorIn)
            .curve(points.sFloorInCp2, points.sCalfInCp1, points.sCalfIn)
            .curve(points.sCalfInCp2, points.sKneeInCp1, points.sKneeIn)
            .curve(points.sKneeInCp2, points.sUpperLegInCp1, points.sUpperLegIn)
        } else {
          return new Path()
            .move(points.sFloorIn)
            .curve(points.sFloorInCp2, points.sKneeInCp1, points.sKneeIn)
            .curve(points.sKneeInCp2, points.sUpperLegInCp1, points.sUpperLegIn)
        }
      } else {
        if (options.fitCalf) {
          return new Path()
            .move(points.sFloorIn)
            .curve(points.sFloorInCp2, points.sCalfInCp1, points.sCalfIn)
            .curve(points.sCalfInCp2, points.sUpperLegInCp1, points.sUpperLegIn)
        } else {
          return new Path()
            .move(points.sFloorIn)
            .curve(points.sFloorInCp2, points.sUpperLegInCp1, points.sUpperLegIn)
        }
      }
    }

    points.mBottomOut = points.bottomOut.flipY(points.mSplitOut)
    points.mBottomIn = points.bottomIn.flipY(points.mSplitIn)

    if (options.legLength < 1) {
      paths.mOutSeam0 = drawShiftOutseam()
        .split(points.mSplitOut)[1]
        .split(points.mBottomOut)[0]
        .hide()
    } else {
      paths.mOutSeam0 = drawShiftOutseam().split(points.mSplitOut)[1].hide()
    }
    paths.mInseam1 = drawShiftInseam().split(points.mBottomIn)[1].split(points.mSplitIn)[0].hide()

    const drawSeamLeft = () => {
      if (options.legBandStyle == 'cuffed') {
        return paths.outSeam.join(paths.outSeam0).join(paths.mOutSeam0)
      }
      if (options.legBandStyle == 'bandStraight' || options.legBandStyle == 'bandCurved') {
        return paths.outSeam.split(points.splitOut)[0]
      }
      if (options.legBandStyle == 'turnover') {
        return paths.outSeam.join(paths.outSeam0)
      }
    }

    paths.seamLeft = options.frontPocketsBool
      ? drawSeamLeft().split(points.frontPocketOpeningOut)[1].hide()
      : drawSeamLeft().hide()

    const drawSeamRight = () => {
      if (options.legBandStyle == 'cuffed') {
        return paths.mInseam1.join(paths.inseam1).join(paths.inseam)
      }
      if (options.legBandStyle == 'bandStraight' || options.legBandStyle == 'bandCurved') {
        return paths.inseam.split(points.splitIn)[1]
      }
      if (options.legBandStyle == 'turnover') {
        return paths.inseam1.join(paths.inseam)
      }
    }
    points.hemOut = paths.seamLeft.end()
    points.hemIn = drawSeamRight().start()
    //paths
    const drawWaist = () => {
      if (options.frontPocketsBool) {
        return new Path()
          .move(points.waistIn)
          .line(points.frontPocketOpeningWaist)
          .curve(
            points.frontPocketOpeningWaistCp2,
            points.frontPocketOpeningOutCp1,
            points.frontPocketOpeningOut
          )
      } else {
        return new Path().move(points.waistIn).line(points.waistOut)
      }
    }

    paths.seam = new Path()
      .move(points.hemOut)
      .line(points.hemIn)
      .join(drawSeamRight())
      .join(paths.crotchSeam)
      .join(drawWaist())
      .join(paths.seamLeft)
      .close()
    //pocket check
    points.bottomAnchor =
      options.legBandStyle == 'bandStraight' || options.legBandStyle == 'bandCurved'
        ? points.splitOut
        : points.bottomOut
    if (
      options.frontPocketsBool &&
      points.frontPocketOut.y >
        paths.seamLeft.split(points.bottomAnchor)[0].shiftFractionAlong(0.9).y
    ) {
      delete snippets['frontPocketOut-notch']
      points.frontPocketOut = paths.seamLeft.split(points.bottomAnchor)[0].shiftFractionAlong(0.9)
      if (complete) snippets.frontPocketOut = new Snippet('notch', points.frontPocketOut)
    }

    if (complete) {
      //grainline
      points.grainlineTo = points.split.shift(0, points.split.dx(points.crotchSeamCurveEnd) * 0.5)
      points.grainlineFrom = new Point(points.grainlineTo.x, points.crotchSeamCurveEnd.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //title
      points.title = new Point(
        points.split.x,
        points.crotchSeamCurveEnd.y + points.crotchSeamCurveEnd.dy(points.split) * 0.1
      )
      macro('title', {
        nr: 4,
        title: 'Front',
        at: points.title,
        cutNr: 2,
        scale: 0.5,
      })
      //logo
      points.logo = new Point(
        points.split.x,
        points.crotchSeamCurveEnd.y + points.crotchSeamCurveEnd.dy(points.split) * 0.425
      )
      macro('logorg', { at: points.logo, scale: 1 / 3 })
      //scalebox
      points.scalebox = new Point(
        points.split.x,
        points.crotchSeamCurveEnd.y + points.crotchSeamCurveEnd.dy(points.split) * 0.75
      )
      macro('scalebox', { at: points.scalebox })
      //fit guides
      if (options.fitGuides && points.bottomAnchor.y <= points.kneeGuideIn.y) {
        delete paths.kneeGuide
        delete snippets['kneeGuideIn-notch']
        delete snippets['kneeGuideOut-notch']
      }
      //paths
      if (options.legBandStyle != 'bandStraight' && options.legBandStyle != 'bandCurved') {
        paths.hemFold = new Path()
          .move(points.bottomOut)
          .line(points.bottomIn)
          .attr('class', 'mark help')
          .attr('data-text', 'Hem Fold-line')
          .attr('data-text-class', 'center')
        if (options.legBandStyle == 'cuffed') {
          paths.cuffFold = new Path()
            .move(points.mSplitOut)
            .line(points.mSplitIn)
            .attr('class', 'mark help')
            .attr('data-text', 'Cuff Fold-line')
            .attr('data-text-class', 'center')
        }
      }
      if (sa) {
        const sideSeamSa = sa * options.sideSeamSaWidth * 100
        const inseamSa = sa * options.inseamSaWidth * 100

        points.saHemOut = utils.beamIntersectsY(
          paths.seamLeft.offset(sideSeamSa).shiftFractionAlong(0.995),
          paths.seamLeft.offset(sideSeamSa).end(),
          points.hemIn.y + sa
        )
        points.saHemIn = utils.beamIntersectsY(
          drawSeamRight().offset(inseamSa).start(),
          drawSeamRight().offset(inseamSa).shiftFractionAlong(0.005),
          points.hemOut.y + sa
        )

        const drawSaWaist = () => {
          if (options.frontPocketsBool) {
            return new Path()
              .move(points.saWaistIn)
              .line(points.saFrontPocketOpeningWaist)
              .join(paths.pocketCurve.offset(sa))
              .line(points.saFrontPocketOpeningOut)
          } else {
            return new Path().move(points.saWaistIn).line(points.saWaistOut)
          }
        }

        paths.sa = new Path()
          .move(points.saHemOut)
          .line(points.saHemIn)
          .join(drawSeamRight().offset(inseamSa))
          .line(points.saUpperLegIn)
          .join(paths.crotchSeam.offset(sa * options.crotchSeamSaWidth * 100))
          .line(points.saWaistIn)
          .join(drawSaWaist())
          .join(paths.seamLeft.offset(sideSeamSa))
          .line(points.saHemOut)
          .close()
          .attr('class', 'fabric sa')
      }
    }
    return part
  },
}
