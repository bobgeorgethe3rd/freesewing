import { flyFunction } from '@freesewing/flyfront'
import { flyBase } from '@freesewing/flyfront'
import { front as frontDalton } from '@freesewing/dalton'
import { back } from './back.mjs'

export const frontBase = {
  name: 'jackson.frontBase',
  from: frontDalton,
  after: back,
  hide: {
    from: true,
  },
  options: {
    //Imported
    ...flyBase.options,
    //Style
    fitWaistFront: { bool: true, menu: 'style' }, //Altered For Jackson
    //Pockets
    frontPocketsBool: { bool: true, menu: 'pockets' },
    frontPocketWidth: { pct: 50, min: 30, max: 60, menu: 'pockets.frontPockets' },
    frontPocketOpeningWidth: { pct: 50, min: 45, max: 60, menu: 'pockets.frontPockets' },
    frontPocketOpeningDepth: { pct: 16.6, min: 12, max: 20, menu: 'pockets.frontPockets' },
    frontPocketOpeningCurve: { pct: 66.7, min: 50, max: 100, menu: 'pockets.frontPockets' },
    frontPocketOutSeamDepth: { pct: 61, min: 30, max: 75, menu: 'pockets.frontPockets' }, //71.5
    //Construction
    crotchSeamSaWidth: { pct: 1, min: 1, max: 3, menu: 'construction' },
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
    //deleting snippets
    delete snippets.crotchSeamCurveEnd
    //removing macros not required from Dalton
    macro('title', false)
    //measurements
    const waistbandWidth = store.get('waistbandWidth')
    const flyFrontWidth = measurements.waist * options.flyFrontWidth
    const flyFrontLength =
      (measurements.crossSeamFront - measurements.waistToHips) * options.flyFrontLength
    const flyFrontShieldEx = 10 //(1 - options.flyFrontWidth) * 10.537407797681770284510010537408
    //let's begin
    //plackets
    flyFunction(part, waistbandWidth, flyFrontWidth, flyFrontLength, flyFrontShieldEx)
    //if pockets
    if (options.frontPocketsBool) {
      //measures
      const pocketMaxDepth = measurements.waistToKnee - measurements.waistToHips - waistbandWidth

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

      points.frontPocketOpeningOut = drawOutseam().shiftAlong(
        pocketMaxDepth * options.frontPocketOpeningDepth
      )
      points.frontPocketOpeningWaist = points.waistOut.shiftFractionTowards(
        points.waistIn,
        options.frontPocketOpeningWidth
      )
      points.frontPocketOpeningCpTarget = utils.beamsIntersect(
        points.frontPocketOpeningWaist,
        points.waistOut.rotate(90, points.frontPocketOpeningWaist),
        points.frontPocketOpeningOut,
        points.frontPocketOpeningOut.shift(points.waistOut.angle(points.waistIn), 1)
      )
      points.frontPocketOpeningWaistCp2 = points.frontPocketOpeningWaist.shiftFractionTowards(
        points.frontPocketOpeningCpTarget,
        options.frontPocketOpeningCurve
      )
      points.frontPocketOpeningOutCp1 = points.frontPocketOpeningOut.shiftFractionTowards(
        points.frontPocketOpeningCpTarget,
        options.frontPocketOpeningCurve
      )
      points.frontPocketOut = drawOutseam().shiftAlong(
        pocketMaxDepth * options.frontPocketOutSeamDepth
      )
      points.frontPocketWaist = points.frontPocketOpeningWaist.shiftFractionTowards(
        points.waistIn,
        options.frontPocketWidth
      )

      paths.pocketCurve = new Path()
        .move(points.frontPocketOpeningWaist)
        .curve(
          points.frontPocketOpeningWaistCp2,
          points.frontPocketOpeningOutCp1,
          points.frontPocketOpeningOut
        )
        .hide()

      if (complete) {
        if (sa) {
          const sideSeamSa = sa * options.sideSeamSaWidth * 100

          points.saFrontPocketOpeningWaist = points.frontPocketOpeningWaist
            .shift(points.waistIn.angle(points.waistOut) - 90, sa)
            .shift(points.waistIn.angle(points.waistOut), sa)

          points.saFrontPocketOpeningOut = utils.beamsIntersect(
            points.frontPocketOpeningOutCp1
              .shiftTowards(points.frontPocketOpeningOut, sa)
              .rotate(-90, points.frontPocketOpeningOutCp1),
            points.frontPocketOpeningOut
              .shiftTowards(points.frontPocketOpeningOutCp1, sa)
              .rotate(90, points.frontPocketOpeningOut),
            drawOutseam().split(points.frontPocketOpeningOut)[1].offset(sideSeamSa).start(),
            drawOutseam()
              .split(points.frontPocketOpeningOut)[1]
              .offset(sideSeamSa)
              .shiftFractionAlong(0.01)
          )
        }
      }
    }
    return part
  },
}
