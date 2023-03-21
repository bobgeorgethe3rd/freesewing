import { back as daltonBack } from '@freesewing/dalton'
import { pctBasedOn } from '@freesewing/core'

export const backBase = {
  name: 'jackson.backBase',
  from: daltonBack,
  hide: {
    from: true,
  },
  options: {
    //Dalton
    //Constants
    legBandWidth: 0, //locked for Jackson
    //Fit
    waistEase: { pct: 5.7, min: -20, max: 20, menu: 'fit' }, //altered for Jackson 5.7 //11.8
    seatEase: { pct: 4.7, min: -20, max: 10, menu: 'fit' }, //altered for Jackson 4.7 // 7.6
    kneeEase: { pct: 9.5, min: -25, max: 25, menu: 'fit' }, //altered for Jackson 9.5 //9.4
    heelEase: { pct: 11, min: -25, max: 25, menu: 'fit' }, //altered for Jackson
    ankleEase: { pct: 16.2, min: -25, max: 25, menu: 'fit' }, //altered for Jackson
    //Style
    waistbandWidth: {
      pct: 3.8,
      min: 1,
      max: 6,
      snap: 5,
      ...pctBasedOn('waistToFloor'),
      menu: 'style',
    }, // based on size 40 //altered for Jackson
    waistHeight: { pct: 0, min: 0, max: 100, menu: 'style' }, //altered for Jackson
    //Darts
    backDartWidth: { pct: 1.2, min: 0, max: 3, menu: 'darts' }, //1.2 //altered for Jackson
    backDartDepth: { pct: 66.7, min: 45, max: 70, menu: 'darts' }, //altered for Jackson
    //Advanced
    backDartMultiplier: { count: 1, min: 0, max: 2, menu: 'advanced' }, //altered for Jackson
    //Jackson
    //Style
    yokeAngle: { deg: 5.1, min: 3.5, max: 5.6, menu: 'style' },
    //Pockets
    backPocketsBool: { bool: true, menu: 'pockets' },
    backPocketBalance: { pct: 45.9, min: 40, max: 70, menu: 'pockets.backPockets' },
    // backPocketPlacement: {pct: 3, min: 2.5, max: 5, menu:'pockets.backPockets'},
    backPocketPlacement: { pct: 73.5, min: 70, max: 100, menu: 'pockets.backPockets' },
    backPocketWidth: { pct: 20.1, min: 15, max: 22.5, menu: 'pockets.backPockets' },
    backPocketDepth: { pct: 11, min: 8, max: 15, menu: 'pockets.backPockets' },
    patchPocketWidthOffset: { pct: 17.6, min: 0, max: 20, menu: 'pockets.backPockets' },
    backPocketPeak: { pct: 26.9, min: 0, max: 30, menu: 'pockets.backPockets' },
    sidePocketsBool: { bool: false, menu: 'pockets' },
    sidePocketBalance: { pct: 50, min: 40, max: 70, menu: 'pockets.sidePockets' },
    sidePocketPlacement: { pct: 6, min: 0, max: 8, menu: 'pockets.sidePockets' },
    sidePocketWidth: { pct: 23.7, min: 20, max: 25, menu: 'pockets.sidePockets' }, //default of off 38
    sidePocketDepth: { pct: 29.2, min: 25, max: 30, menu: 'pockets.sidePockets' }, //default of off 38 //35 for higher back pocket
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
    log,
    absoluteOptions,
  }) => {
    //removing paths and snippets not required from Dalton
    for (let i in paths) delete paths[i]
    for (let i in snippets) delete snippets[i]
    //removing macros not required from Dalton
    macro('title', false)
    macro('scalebox', false)
    //outseam guide
    const drawOutseam = () => {
      let waistOut = points.styleWaistOut || points.waistOut
      if (options.fitKnee && !options.fitFloor) {
        if (points.waistOut.x > points.seatOut.x)
          return new Path()
            .move(points.floorOut)
            .line(points.kneeOut)
            .curve(points.kneeOutCp2, points.seatOut, waistOut)
        else
          return new Path()
            .move(points.floorOut)
            .line(points.kneeOut)
            .curve(points.kneeOutCp2, points.seatOutCp1, points.seatOut)
            .curve_(points.seatOutCp2, waistOut)
      }
      if (options.fitFloor) {
        if (points.waistOut.x > points.seatOut.x)
          return new Path()
            .move(points.floorOut)
            .curve_(points.floorOutCp2, points.kneeOut)
            .curve(points.kneeOutCp2, points.seatOut, waistOut)
        else
          return new Path()
            .move(points.floorOut)
            .curve_(points.floorOutCp2, points.kneeOut)
            .curve(points.kneeOutCp2, points.seatOutCp1, points.seatOut)
            .curve_(points.seatOutCp2, waistOut)
      }
      if (!options.fitKnee && !options.fitFloor) {
        if (points.waistOut.x > points.seatOut.x)
          return new Path().move(points.floorOut).curve(points.kneeOutCp2, points.seatOut, waistOut)
        else
          return new Path()
            .move(points.floorOut)
            .curve(points.kneeOutCp2, points.seatOutCp1, points.seatOut)
            .curve_(points.seatOutCp2, waistOut)
      }
    }
    //measures
    // let backPocketPlacement = measurements.waistToFloor * options.backPocketPlacement
    let backPocketPlacement =
      points.dartTip.dist(points.dartSeat) * (1 - options.backPocketPlacement)
    let backPocketWidth = measurements.waist * options.backPocketWidth
    let backPocketDepth = measurements.waistToFloor * options.backPocketDepth
    let sidePocketPlacement =
      drawOutseam().length() -
      measurements.waistToKnee * (1 - options.sidePocketPlacement) +
      measurements.waistToHips * (1 - options.waistHeight) +
      absoluteOptions.waistbandWidth
    let sidePocketWidth = measurements.waist * options.sidePocketWidth
    let sidePocketDepth = measurements.waistToKnee * options.sidePocketDepth

    //yoke
    points.yokeInTarget = points.dartTip
      .shiftTowards(points.dartMid, measurements.waist * 4)
      .rotate(90 + options.yokeAngle, points.dartTip)
    points.yokeOutTarget = points.dartTip
      .shiftTowards(points.dartMid, measurements.waist * 4)
      .rotate(-90 + options.yokeAngle, points.dartTip)

    if (points.yokeInTarget.y > points.crossSeamCurveStart.y) {
      points.yokeIn = utils.lineIntersectsCurve(
        points.dartTip,
        points.yokeInTarget,
        points.crossSeamCurveStart,
        points.crossSeamCurveCp1,
        points.crossSeamCurveCp2,
        points.fork
      )
      log.info(
        'points.yokeIn intersects with the crossSeamCurve, This may be an indicated of inaccurate measures.'
      )
    } else {
      points.yokeIn = utils.beamsIntersect(
        points.dartTip,
        points.yokeInTarget,
        points.styleWaistIn,
        points.crossSeamCurveStart
      )
    }

    let waistOut = points.styleWaistOut || points.waistOut
    if (points.waistOut.x > points.seatOut.x) {
      if (options.fitKnee || options.fitFloor) {
        points.yokeOut = utils.lineIntersectsCurve(
          points.dartTip,
          points.yokeOutTarget,
          points.kneeOut,
          points.kneeOutCp2,
          points.seatOut,
          waistOut
        )
      } else {
        points.yokeOut = utils.lineIntersectsCurve(
          points.dartTip,
          points.yokeOutTarget,
          points.floorOut,
          points.kneeOutCp2,
          points.seatOut,
          waistOut
        )
      }
    } else {
      points.yokeOut = utils.lineIntersectsCurve(
        points.dartTip,
        points.yokeOutTarget,
        points.seatOut,
        points.seatOutCp2,
        waistOut,
        waistOut
      )
    }
    //yoke guide

    // paths.yokeLine = new Path()
    // .move(points.yokeIn)
    // .line(points.yokeOut)

    //backPocket
    if (options.backPocketsBool) {
      points.seatMid = points.styleSeatOut.shiftFractionTowards(points.styleSeatIn, 0.5)
      points.backPocketTopAnchor = points.seatMid
        .shiftTowards(points.seatOut, backPocketPlacement)
        .rotate(90, points.seatMid)
      points.backPocketTopIn = points.backPocketTopAnchor
        .shiftTowards(points.seatMid, backPocketWidth * options.backPocketBalance)
        .rotate(-90, points.backPocketTopAnchor)
      points.backPocketTopOut = points.backPocketTopAnchor
        .shiftTowards(points.seatMid, backPocketWidth * (1 - options.backPocketBalance))
        .rotate(90, points.backPocketTopAnchor)
      points.backPocketTopMid = points.backPocketTopIn.shiftFractionTowards(
        points.backPocketTopOut,
        0.5
      )
      points.backPocketBottomMid = points.backPocketTopMid
        .shiftTowards(points.backPocketTopIn, backPocketDepth)
        .rotate(90, points.backPocketTopMid)
      points.backPocketBottomLeft = points.backPocketBottomMid
        .shiftTowards(
          points.backPocketTopMid,
          (backPocketWidth * (1 - options.patchPocketWidthOffset)) / 2
        )
        .rotate(90, points.backPocketBottomMid)
      points.backPocketBottomRight = points.backPocketBottomLeft.rotate(
        180,
        points.backPocketBottomMid
      )
      points.backPocketPeak = points.backPocketTopMid.shiftFractionTowards(
        points.backPocketBottomMid,
        1 + options.backPocketPeak
      )
      //backPocket guide

      // paths.backPocketLine = new Path()
      // .move(points.backPocketTopIn)
      // .line(points.backPocketBottomLeft)
      // .line(points.backPocketPeak)
      // .line(points.backPocketBottomRight)
      // .line(points.backPocketTopOut)
      // .attr('class', 'interfacing lashed')
    }
    //sidePocket
    if (options.sidePocketsBool) {
      points.sidePocketBottomAnchor = drawOutseam().shiftAlong(sidePocketPlacement)
      points.sidePocketAngleAnchor = drawOutseam().shiftAlong(sidePocketPlacement * 1.001)
      points.sidePocketBottomLeft = points.sidePocketBottomAnchor
        .shiftTowards(points.sidePocketAngleAnchor, sidePocketWidth * options.sidePocketBalance)
        .rotate(90, points.sidePocketBottomAnchor)
      points.sidePocketTopLeft = points.sidePocketBottomLeft
        .shiftTowards(points.sidePocketBottomAnchor, sidePocketDepth)
        .rotate(90, points.sidePocketBottomLeft)

      //sidePocket guide

      // paths.sidePocketLine = new Path()
      // .move(points.sidePocketTopLeft)
      // .line(points.sidePocketBottomLeft)
      // .line(points.sidePocketBottomAnchor)
      // .attr('class', 'interfacing lashed')
    }

    //stores
    store.set('patchPocketWidth', backPocketWidth)
    store.set('patchPocketDepth', backPocketDepth)
    store.set('sidePocketWidth', sidePocketWidth)
    store.set('sidePocketDepth', sidePocketDepth)
    store.set('sidePocketPlacement', sidePocketPlacement)

    return part
  },
}
