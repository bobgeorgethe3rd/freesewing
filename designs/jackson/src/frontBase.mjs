import { front as daltonFront } from '@freesewing/dalton'
import { backBase } from './backBase.mjs'

export const frontBase = {
  name: 'jackson.frontBase',
  from: daltonFront,
  after: backBase,
  hide: {
    from: true,
  },
  options: {
    //Pockets
    frontPocketsBool: { bool: true, menu: 'pockets' },
    frontPocketWidth: { pct: 68.2, min: 65, max: 75, menu: 'pockets.frontPockets' },
    frontPocketOpeningWidth: { pct: 50, min: 45, max: 60, menu: 'pockets.frontPockets' },
    frontPocketOpeningDepth: { pct: 14.9, min: 12, max: 20, menu: 'pockets.frontPockets' },
    frontPocketOpeningCurve: { pct: 66.7, min: 50, max: 100, menu: 'pockets.frontPockets' },
    frontPocketOutSeamDepth: { pct: 31.7, min: 30, max: 40, menu: 'pockets.frontPockets' },
    //Plackets
    flyDepth: { pct: 64, min: 60, max: 70, menu: 'plackets' },
    flyWidth: { pct: 18.2, min: 18, max: 20, menu: 'plackets' },
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
    const frontPocketOpeningDepth =
      (measurements.waistToKnee - measurements.waistToHips - absoluteOptions.waistbandWidth) *
      options.frontPocketOpeningDepth
    const frontPocketOutSeamDepth =
      (measurements.waistToKnee - measurements.waistToHips - absoluteOptions.waistbandWidth) *
      options.frontPocketOutSeamDepth
    const flyDepth =
      (measurements.crossSeamFront - measurements.waistToHips - absoluteOptions.waistbandWidth) *
      (1 - options.flyDepth)
    //draw guides
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

    //lets begin
    if (options.frontPocketsBool) {
      //pocket opening
      points.frontPocketOpeningWaist = points.styleWaistOut.shiftFractionTowards(
        points.styleWaistIn,
        options.frontPocketOpeningWidth
      )
      points.frontPocketWaist = points.styleWaistOut.shiftFractionTowards(
        points.styleWaistIn,
        options.frontPocketWidth
      )
      points.frontPocketOpeningOut = drawOutseam().shiftAlong(frontPocketOpeningDepth)
      points.frontPocketOpeningCpTarget = utils.beamsIntersect(
        points.frontPocketOpeningWaist,
        points.styleWaistOut.rotate(90, points.frontPocketOpeningWaist),
        points.frontPocketOpeningOut,
        points.frontPocketOpeningOut.shift(points.styleWaistOut.angle(points.styleWaistIn), 1)
      )
      points.frontPocketOpeningCp1 = points.frontPocketOpeningWaist.shiftFractionTowards(
        points.frontPocketOpeningCpTarget,
        2 / 3
      )
      points.frontPocketOpeningCp2 = points.frontPocketOpeningOut.shiftFractionTowards(
        points.frontPocketOpeningCpTarget,
        options.frontPocketOpeningCurve
      )
      points.frontPocketOutSeam = drawOutseam().shiftAlong(frontPocketOutSeamDepth)
      // paths.frontPocketOpening = new Path()
      // .move(points.frontPocketOpeningOut)
      // .curve(
      // points.frontPocketOpeningCp2,
      // points.frontPocketOpeningCp1,
      // points.frontPocketOpeningWaist
      // )
    }

    points.flyCrotch = new Path()
      .move(points.fork)
      .curve(points.crotchSeamCurveCp1, points.crotchSeamCurveCp2, points.crotchSeamCurveStart)
      .line(points.styleWaistIn)
      .shiftAlong(flyDepth)

    const flyShieldDepthExt =
      (points.styleWaistIn.dist(points.styleWaistOut) * options.flyWidth) / 4

    points.flyCurveEnd = utils.beamsIntersect(
      points.styleWaistIn,
      points.crotchSeamCurveStart,
      points.flyCrotch,
      points.flyCrotch.shift(points.styleWaistIn.angle(points.styleWaistOut), 1)
    )

    points.flyShieldCurveEnd = points.styleWaistIn.shiftOutwards(
      points.flyCurveEnd,
      flyShieldDepthExt
    )
    points.flyShieldCrotch = utils.lineIntersectsCurve(
      points.flyShieldCurveEnd,
      points.flyShieldCurveEnd.shift(
        points.styleWaistOut.angle(points.styleWaistIn),
        measurements.seat
      ),
      points.fork,
      points.crotchSeamCurveCp1,
      points.crotchSeamCurveCp2,
      points.crotchSeamCurveStart
    )

    //stores
    store.set('frontPocketOpeningDepth', frontPocketOpeningDepth)
    store.set('flyDepth', flyDepth)
    store.set('flyShieldDepthExt', flyShieldDepthExt)
    store.set('waistFront', points.styleWaistOut.dist(points.styleWaistIn))
    store.set('waistFrontTop', points.waistTopOut.dist(points.waistTopIn))
    store.set('waistbandLength', store.get('waistFront') * 2 + store.get('waistbandBack'))
    store.set('waistbandLengthTop', store.get('waistFrontTop') * 2 + store.get('waistBackTop'))
    store.set('maxButtons', 1)
    return part
  },
}
