import { front as daltonFront } from '@freesewing/dalton'
import { backBase } from './backBase.mjs'

export const frontBase = {
  name: 'theobald.frontBase',
  from: daltonFront,
  after: backBase,
  hide: {
    from: true,
  },
  options: {
    //Style
    frontPleatWidth: { pct: 3.5, min: 3, max: 5, menu: 'style' },
    //Pockets
    frontPocketOpeningWidth: { pct: 20.1, min: 15, max: 30, menu: 'pockets.frontPockets' },
    frontPocketOpening: { pct: 6.4, min: 5, max: 10, menu: 'pockets.frontPockets' },
    frontPocketOpeningDepth: { pct: 15.5, min: 10, max: 20, menu: 'pockets.frontPockets' },
    //Plackets
    flyWidth: { pct: 20.1, min: 15, max: 30, menu: 'plackets' },
    flyDepth: { pct: 60.3, min: 55, max: 70, menu: 'plackets' },
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
  }) => {
    //removing paths and snippets not required from Dalton
    for (let i in paths) delete paths[i]
    for (let i in snippets) delete snippets[i]
    //removing macros not required from Dalton
    macro('title', false)
    macro('scalebox', false)
    //measurements
    const frontPleatWidth = measurements.waist * options.frontPleatWidth
    const frontPocketOpening =
      measurements.waistToFloor * options.frontPocketOpening - absoluteOptions.waistbandWidth
    const frontPocketOpeningDepth = measurements.waistToFloor * options.frontPocketOpeningDepth
    const flyDepth =
      (measurements.crossSeamFront - measurements.waistToHips - absoluteOptions.waistbandWidth) *
      (1 - options.flyDepth)
    //let's begin
    points.pivot = points.knee.shiftFractionTowards(points.floor, 0.5)
    points.waistSplit = utils.beamsIntersect(
      points.floor,
      points.knee,
      points.styleWaistIn,
      points.styleWaistOut
    )
    points.pivotOutTarget = points.waistSplit.rotate(90, points.pivot)
    points.pivotInTarget = points.waistSplit.rotate(-90, points.pivot)
    if (options.fitFloor) {
      points.pivotOut = utils.lineIntersectsCurve(
        points.pivot,
        points.pivotOutTarget,
        points.kneeOut,
        points.kneeOut,
        points.floorOutCp1,
        points.floorOut
      )
      points.pivotIn = utils.lineIntersectsCurve(
        points.pivot,
        points.pivotInTarget,
        points.floorIn,
        points.floorInCp2,
        points.kneeIn,
        points.kneeIn
      )
    } else {
      if (options.fitKnee) {
        points.pivotOut = utils.beamsIntersect(
          points.pivot,
          points.pivotOutTarget,
          points.kneeOut,
          points.floorOut
        )
        points.pivotIn = utils.beamsIntersect(
          points.pivot,
          points.pivotInTarget,
          points.kneeIn,
          points.floorIn
        )
      } else {
        if (points.waistOut.x < points.seatOut.x) {
          points.pivotOut = utils.lineIntersectsCurve(
            points.pivot,
            points.pivotOutTarget,
            points.styleWaistOut,
            points.seatOut,
            points.kneeOutCp1,
            points.floorOut
          )
        } else {
          points.pivotOut = utils.lineIntersectsCurve(
            points.pivot,
            points.pivotOutTarget,
            points.seatOut,
            points.seatOutCp2,
            points.kneeOutCp1,
            points.floorOut
          )
        }
        points.pivotIn = utils.lineIntersectsCurve(
          points.pivot,
          points.pivotInTarget,
          points.floorIn,
          points.kneeInCp2,
          points.forkCp1,
          points.fork
        )
      }
    }
    //fly point
    points.flyCrotch = new Path()
      .move(points.fork)
      .curve(points.crotchSeamCurveCp1, points.crotchSeamCurveCp2, points.crotchSeamCurveStart)
      .line(points.styleWaistIn)
      .shiftAlong(flyDepth)

    //rotate
    //find the angle
    let wedgeAngle = 1
    let target = frontPleatWidth * (7 / 6)
    let delta
    do {
      points.waistSplitOut = points.waistSplit.rotate(wedgeAngle, points.pivotOut)
      points.waistSplitIn = points.waistSplit.rotate(-wedgeAngle, points.pivotIn)

      delta = points.waistSplitOut.dist(points.waistSplitIn) - target
      if (delta > 0) wedgeAngle = wedgeAngle * 0.99
      else wedgeAngle = wedgeAngle * 1.01
    } while (Math.abs(delta) > 1)

    const rotOut = [
      'waistOut',
      'styleWaistOut',
      'seatOutCp1',
      'seatOut',
      'seatOutCp2',
      'kneeOutCp1',
      'kneeOut',
    ]
    for (const p of rotOut) {
      points[p + 'R'] = points[p].rotate(wedgeAngle, points.pivotOut)
    }

    const rotIn = [
      'kneeIn',
      'kneeInCp2',
      'forkCp1',
      'fork',
      'crotchSeamCurveCp1',
      'crotchSeamCurveCp2',
      'crotchSeamCurveStart',
      'flyCrotch',
      'styleWaistIn',
      'waistIn',
    ]
    for (const p of rotIn) {
      points[p + 'R'] = points[p].rotate(-wedgeAngle, points.pivotIn)
    }

    points.styleWaistOutR = points.styleWaistInR.shiftOutwards(
      points.styleWaistOutR,
      frontPleatWidth * (5 / 6)
    )
    points.floorOutCp1R = utils.beamsIntersect(
      points.kneeOutCp1R,
      points.kneeOutR,
      points.floorOut,
      points.floorIn.rotate(90, points.floorOut)
    )
    points.floorInCp2R = utils.beamsIntersect(
      points.kneeInCp2R,
      points.kneeInR,
      points.floorIn,
      points.floorOut.rotate(-90, points.floorIn)
    )

    //pocket
    const drawOutseam = () => {
      let waistOut = points.styleWaistOut || points.waistOut
      if (options.fitKnee && !options.fitFloor) {
        if (points.waistOut.x < points.seatOut.x)
          return new Path()
            .move(waistOut)
            .curve(points.seatOut, points.kneeOutCp1, points.kneeOut)
            .line(points.floorOut)
        else
          return new Path()
            .move(waistOut)
            ._curve(points.seatOutCp1, points.seatOut)
            .curve(points.seatOutCp2, points.kneeOutCp1, points.kneeOut)
            .line(points.floorOut)
      }
      if (options.fitFloor) {
        if (points.waistOut.x < points.seatOut.x)
          return new Path()
            .move(waistOut)
            .curve(points.seatOut, points.kneeOutCp1, points.kneeOut)
            ._curve(points.floorOutCp1, points.floorOut)
        else
          return new Path()
            .move(waistOut)
            ._curve(points.seatOutCp1, points.seatOut)
            .curve(points.seatOutCp2, points.kneeOutCp1, points.kneeOut)
            ._curve(points.floorOutCp1, points.floorOut)
      }
      if (!options.fitKnee && !options.fitFloor) {
        if (points.waistOut.x < points.seatOut.x)
          return new Path().move(waistOut).curve(points.seatOut, points.kneeOutCp1, points.floorOut)
        else
          return new Path()
            .move(waistOut)
            ._curve(points.seatOutCp1, points.seatOut)
            .curve(points.seatOutCp2, points.kneeOutCp1, points.floorOut)
      }
    }

    const drawOutseamR = () => {
      let waistOut = points.styleWaistOut || points.waistOut
      let waistOutR = points.styleWaistOutR || points.waistOutR
      if (options.fitKnee || options.fitFloor) {
        if (points.waistOut.x < points.seatOut.x)
          return new Path()
            .move(waistOutR)
            .curve(points.seatOutR, points.kneeOutCp1R, points.kneeOutR)
            ._curve(points.floorOutCp1R, points.floorOut)
        else
          return new Path()
            .move(waistOutR)
            ._curve(points.seatOutCp1R, points.seatOutR)
            .curve(points.seatOutCp2R, points.kneeOutCp1R, points.kneeOutR)
            ._curve(points.floorOutCp1R, points.floorOut)
      } else {
        if (points.waistOut.x < points.seatOut.x)
          return new Path()
            .move(waistOutR)
            .curve(points.seatOutR, points.kneeOutCp1, points.floorOut)
        else
          return new Path()
            .move(waistOutR)
            ._curve(points.seatOutCp1R, points.seatOutR)
            .curve(points.seatOutCp2R, points.kneeOutCp1, points.floorOut)
      }
    }

    points.frontPocketOpeningWaist = points.styleWaistOut.shiftFractionTowards(
      points.styleWaistIn,
      options.frontPocketOpeningWidth
    )
    points.frontPocketOpeningWaistR = points.styleWaistOutR.shiftTowards(
      points.styleWaistInR,
      points.styleWaistOut.dist(points.frontPocketOpeningWaist)
    )
    points.frontPocketOpeningOut = drawOutseam().shiftAlong(frontPocketOpeningDepth)
    points.frontPocketOpeningOutR = drawOutseamR().shiftAlong(frontPocketOpeningDepth)

    points.frontPocketOpening = drawOutseam().shiftAlong(frontPocketOpening)
    points.frontPocketOpeningR = drawOutseamR().shiftAlong(frontPocketOpening)

    //plackets
    const flyShieldDepthExt =
      (points.styleWaistIn.dist(points.styleWaistOut) * options.flyWidth) / 4

    const suffix = ['', 'R']
    for (const p of suffix) {
      points['flyCurveEnd' + p] = utils.beamsIntersect(
        points['styleWaistIn' + p],
        points['crotchSeamCurveStart' + p],
        points['flyCrotch' + p],
        points['flyCrotch' + p].shift(
          points['styleWaistIn' + p].angle(points['styleWaistOut' + p]),
          1
        )
      )

      points['flyShieldCurveEnd' + p] = points['styleWaistIn' + p].shiftOutwards(
        points['flyCurveEnd' + p],
        flyShieldDepthExt
      )
      points['flyShieldCrotch' + p] = utils.lineIntersectsCurve(
        points['flyShieldCurveEnd' + p],
        points['flyShieldCurveEnd' + p].shift(
          points['styleWaistOut' + p].angle(points['styleWaistIn' + p]),
          measurements.seat
        ),
        points['fork' + p],
        points['crotchSeamCurveCp1' + p],
        points['crotchSeamCurveCp2' + p],
        points['crotchSeamCurveStart' + p]
      )
    }

    //stores
    let frontPleatSuffix
    if (options.frontPleats) {
      frontPleatSuffix = 'R'
    } else {
      frontPleatSuffix = ''
    }
    store.set('waistFront', points.styleWaistOut.dist(points.styleWaistIn))
    store.set('waistFrontTop', points.waistTopOut.dist(points.waistTopIn))
    store.set('waistbandLength', store.get('waistFront') * 2 + store.get('waistbandBack'))
    store.set('waistbandLengthTop', store.get('waistFrontTop') * 2 + store.get('waistBackTop'))
    store.set('maxButtons', 1)
    store.set('frontPleatWidth', frontPleatWidth)
    store.set('frontPleatSuffix', frontPleatSuffix)
    store.set('frontPocketOpeningDepth', frontPocketOpeningDepth)
    store.set('wedgeAngle', wedgeAngle)
    store.set('flyDepth', flyDepth)
    store.set('flyShieldDepthExt', flyShieldDepthExt)

    //guide
    // paths.seam.attr('class', 'various')

    // paths.crotchSeamR = new Path()
    // .move(points.forkR)
    // .curve(points.crotchSeamCurveCp1R, points.crotchSeamCurveCp2R, points.crotchSeamCurveStartR)
    // .line(points.styleWaistInR)

    // paths.waistR = new Path()
    // .move(points.styleWaistInR)
    // .line(points.styleWaistOutR)

    // paths.pocketline = new Path()
    // .move(points.frontPocketOpeningWaist)
    // .line(points.frontPocketOpeningOut)
    // .move(points.frontPocketOpeningWaistR)
    // .line(points.frontPocketOpeningOutR)

    // const drawInseamR = () => {
    // if (options.fitKnee || options.fitFloor) {
    // return new Path()
    // .move(points.floorIn)
    // .curve_(points.floorInCp2R, points.kneeInR)
    // .curve(points.kneeInCp2R, points.forkCp1R, points.forkR)
    // } else {
    // return new Path()
    // .move(points.floorIn)
    // .curve(points.kneeInCp2, points.forkCp1R, points.forkR)
    // }
    // }

    // paths.outseam = drawOutseamR()
    // paths.inseam = drawInseamR()

    return part
  },
}
