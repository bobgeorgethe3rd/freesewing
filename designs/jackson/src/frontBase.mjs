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
    frontPocketOpeningWidth: { pct: 50, min: 45, max: 60, menu: 'pockets.frontPockets' },
    frontPocketOpeningDepth: { pct: 14.9, min: 12, max: 20, menu: 'pockets.frontPockets' },
    frontPocketOpeningCurve: { pct: 66.7, min: 50, max: 100, menu: 'pockets.frontPockets' },
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
    // for (let i in paths) delete paths[i]
    for (let i in snippets) delete snippets[i]
    //removing macros not required from Dalton
    macro('title', false)
    macro('scalebox', false)
    //measurements
    let frontPocketOpeningDepth =
      (measurements.waistToKnee - measurements.waistToHips - absoluteOptions.waistbandWidth) *
      options.frontPocketOpeningDepth

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
      if (!options.fitKnee & !options.fitFloor) {
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
      points.stylePocketOpening = points.styleWaistOut.shiftFractionTowards(
        points.styleWaistIn,
        options.frontPocketOpeningWidth
      )
      points.pocketOpeningIn = drawOutseam().shiftAlong(frontPocketOpeningDepth)
      points.pocketOpeningCpTarget = utils.beamsIntersect(
        points.stylePocketOpening,
        points.styleWaistOut.rotate(90, points.stylePocketOpening),
        points.pocketOpeningIn,
        points.pocketOpeningIn.shift(points.styleWaistOut.angle(points.styleWaistIn), 1)
      )
      points.pocketOpeningCp1 = points.pocketOpeningIn.shiftFractionTowards(
        points.pocketOpeningCpTarget,
        options.frontPocketOpeningCurve
      )
      points.pocketOpeningCp2 = points.stylePocketOpening.shiftFractionTowards(
        points.pocketOpeningCpTarget,
        2 / 3
      )

      paths.pocketOpening = new Path()
        .move(points.pocketOpeningIn)
        .curve(points.pocketOpeningCp1, points.pocketOpeningCp2, points.stylePocketOpening)
    }

    return part
  },
}
