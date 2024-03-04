import { frontBase as daltonFrontBase } from '@freesewing/dalton'
import { back } from './back.mjs'

export const frontBase = {
  name: 'jackson.frontBase',
  from: daltonFrontBase,
  after: back,
  hide: {
    from: true,
  },
  options: {
    //Constants
    cpFraction: 0.55191502449,
    //Style
    fitWaistFront: { bool: true, menu: 'style' }, //Altered For Jackson
    //Pockets
    frontPocketsBool: { bool: true, menu: 'pockets' },
    frontPocketWidth: { pct: 50, min: 30, max: 60, menu: 'pockets.frontPockets' },
    frontPocketOpeningWidth: { pct: 50, min: 45, max: 60, menu: 'pockets.frontPockets' },
    frontPocketOpeningDepth: { pct: 16.6, min: 12, max: 20, menu: 'pockets.frontPockets' },
    frontPocketOpeningCurve: { pct: 66.7, min: 50, max: 100, menu: 'pockets.frontPockets' },
    frontPocketOutSeamDepth: { pct: 46, min: 30, max: 50, menu: 'pockets.frontPockets' },
    // Plackets
    flyLength: { pct: 70.2, min: 70, max: 80, menu: 'plackets' },
    flyWidth: { pct: 5.1, min: 5, max: 6, menu: 'plackets' },
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
    delete snippets.crotchSeamCurveStart
    //removing macros not required from Dalton
    macro('title', false)
    //measurements
    const waistbandWidth = store.get('waistbandWidth')
    const flyWidth = measurements.waist * options.flyWidth
    const flyLength = (measurements.crossSeamFront - measurements.waistToHips) * options.flyLength
    const flyShieldEx = 10 //(1 - options.flyWidth) * 10.537407797681770284510010537408
    //let's begin
    //plackets
    points.flyWaist = points.waistIn.shiftTowards(points.waistOut, flyWidth)
    points.flyCrotch = paths.crotchSeam
      .reverse()
      .shiftAlong(measurements.waistToHips * options.waistHeight + flyLength - waistbandWidth)
    points.flyShieldCrotch = paths.crotchSeam
      .reverse()
      .shiftAlong(
        measurements.waistToHips * options.waistHeight + flyLength - waistbandWidth + flyShieldEx
      )
    points.flyShieldExWaist = utils.beamsIntersect(
      points.crotchSeamCurveStart
        .shiftTowards(points.waistIn, flyShieldEx)
        .rotate(-90, points.crotchSeamCurveStart),
      points.waistIn
        .shiftTowards(points.crotchSeamCurveStart, flyShieldEx)
        .rotate(+90, points.waistIn),
      points.flyWaist,
      points.waistIn
    )
    points.flyCurveEnd = utils.beamsIntersect(
      points.waistIn,
      points.crotchSeamCurveStart,
      points.flyCrotch,
      points.flyCrotch.shift(points.crotchSeamCurveStart.angle(points.waistIn) - 90, 1)
    )
    points.flyCpTarget = utils.beamsIntersect(
      points.flyWaist,
      points.flyWaist.shift(points.waistIn.angle(points.crotchSeamCurveStart), 1),
      points.flyCrotch,
      points.flyCurveEnd
    )
    points.flyCurveStart = points.flyCurveEnd.rotate(90, points.flyCpTarget)
    points.flyCurveStartCp2 = points.flyCurveStart.shiftFractionTowards(
      points.flyCpTarget,
      options.cpFraction
    )
    points.flyCurveEndCp1 = points.flyCurveEnd.shiftFractionTowards(
      points.flyCpTarget,
      options.cpFraction
    )
    points.flyShieldExCrotch = utils.beamsIntersect(
      paths.crotchSeam.split(points.flyShieldCrotch)[1].offset(flyShieldEx).start(),
      paths.crotchSeam
        .split(points.flyShieldCrotch)[1]
        .offset(flyShieldEx)
        .shiftFractionAlong(0.01),
      points.flyShieldCrotch,
      points.flyShieldCrotch.shift(points.waistIn.angle(points.crotchSeamCurveStart) - 90, 1)
    )
    paths.placketCurve = new Path()
      .move(points.flyWaist)
      .line(points.flyCurveStart)
      .curve(points.flyCurveStartCp2, points.flyCurveEndCp1, points.flyCurveEnd)
      .hide()
    //stores
    store.set('flyWidth', flyWidth)
    store.set('flyShieldEx', flyShieldEx)
    store.set('waistbandPlacketWidth', flyWidth + flyShieldEx)
    if (complete) {
      if (sa) {
        const crotchSeamSa = sa * options.crotchSeamSaWidth * 100

        points.saFlyWaist = utils.beamsIntersect(
          points.flyWaist.shiftTowards(points.flyCurveStart, sa).rotate(-90, points.flyWaist),
          points.flyCurveStart.shiftTowards(points.flyWaist, sa).rotate(90, points.flyCurveStart),
          points.saWaistOut,
          points.saWaistIn
        )
        points.saWaistInExCorner = utils.beamsIntersect(
          points.saWaistOut,
          points.saWaistIn,
          points.crotchSeamCurveStart
            .shiftTowards(points.waistIn, flyShieldEx + crotchSeamSa)
            .rotate(-90, points.crotchSeamCurveStart),
          points.waistIn
            .shiftTowards(points.crotchSeamCurveStart, flyShieldEx + crotchSeamSa)
            .rotate(90, points.waistIn)
        )
        points.saWaistInEx = utils.beamsIntersect(
          points.saWaistInExCorner,
          points.saWaistInExCorner.shift(points.waistIn.angle(points.crotchSeamCurveStart), 1),
          points.waistOut,
          points.waistIn
        )

        points.saFlyShieldExCrotch = utils.beamsIntersect(
          paths.crotchSeam
            .split(points.flyShieldCrotch)[1]
            .offset(flyShieldEx + crotchSeamSa)
            .start(),
          paths.crotchSeam
            .split(points.flyShieldCrotch)[1]
            .offset(flyShieldEx + crotchSeamSa)
            .shiftFractionAlong(0.001),
          points.flyShieldCrotch.shift(points.waistIn.angle(points.crotchSeamCurveStart), sa),
          points.flyShieldCrotch
            .shift(points.waistIn.angle(points.crotchSeamCurveStart), sa)
            .shift(points.waistIn.angle(points.crotchSeamCurveStart) + 90, 1)
        )
      }
    }
    //if pockets
    if (options.frontPocketsBool) {
      //measures
      const pocketMaxDepth = measurements.waistToKnee - measurements.waistToHips - waistbandWidth

      const drawOutseam = () => {
        if (options.fitKnee) {
          if (points.seatOutAnchor.x < points.seatOut.x)
            return new Path()
              .move(points.waistOut)
              .curve(points.seatOut, points.kneeOutCp1, points.kneeOut)
              ._curve(points.floorOutCp1, points.floorOut)
          else
            return new Path()
              .move(points.waistOut)
              ._curve(points.seatOutCp1, points.seatOut)
              .curve(points.seatOutCp2, points.kneeOutCp1, points.kneeOut)
              ._curve(points.floorOutCp1, points.floorOut)
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
