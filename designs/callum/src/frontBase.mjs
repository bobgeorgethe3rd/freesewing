import { flyFunction } from '@freesewing/flyfront'
import { flyBase } from '@freesewing/flyfront'
import { front as frontDalton } from '@freesewing/dalton'
import { back } from './back.mjs'

export const frontBase = {
  name: 'callum.frontBase',
  from: frontDalton,
  after: back,
  hide: {
    from: true,
  },
  options: {
    //Imported
    ...flyBase.options,
    //Style
    fitWaistFront: { bool: true, menu: 'style' }, //Altered For Caleb
    //Pockets
    frontPocketsBool: { bool: true, menu: 'pockets' },
    frontPocketOpeningWidth: { pct: 20.7, min: 10, max: 30, menu: 'pockets.frontPockets' },
    frontPocketOpeningOutDepth: { pct: 28.9, min: 20, max: 40, menu: 'pockets.frontPockets' },
    frontPocketOpeningTopDepth: { pct: 12, min: 10, max: 20, menu: 'pockets.frontPockets' }, //13.6
    frontPocketOpeningDepth: { pct: 91, min: 90, max: 110, menu: 'pockets.frontPockets' },
    frontPocketDepth: { pct: 30.3, min: 10, max: 40, menu: 'pockets.frontPockets' },
    //Construction
    crotchSeamSaWidth: { pct: 1, min: 1, max: 3, menu: 'construction' },
  },
  measurements: ['wrist'],
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
    const keepPaths = ['seam', 'crotchSeam', 'seatGuide', 'hipsGuide']
    for (const name in paths) {
      if (keepPaths.indexOf(name) === -1) delete paths[name]
    }
    if (options.daltonGuides) {
      paths.daltonGuide = paths.seam.clone().attr('class', 'various lashed')
    }
    delete paths.seam
    const keepSnippets = [
      'crossSeamCurveStart',
      'seatGuideIn-notch',
      'seatGuideOut-notch',
      'hipsGuideIn-notch',
      'hipsGuideOut-notch',
    ]
    for (const name in snippets) {
      if (keepSnippets.indexOf(name) === -1) delete snippets[name]
    }
    //remove macros
    macro('title', false)
    macro('scalebox', false)
    //measurements
    const waistbandWidth = store.get('waistbandWidth')
    const flyFrontWidth = measurements.waist * options.flyFrontWidth
    const flyFrontLength =
      (measurements.crossSeamFront - measurements.waistToHips) * options.flyFrontLength
    const flyFrontShieldEx = 10 //(1 - options.flyFrontWidth) * 10.537407797681770284510010537408
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
    //let's begin
    //plackets
    flyFunction(part, waistbandWidth, flyFrontWidth, flyFrontLength, flyFrontShieldEx)
    //shared points
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
    //if pockets
    if (options.frontPocketsBool) {
      //measures
      const pocketMaxDepth = measurements.waistToKnee - measurements.waistToHips - waistbandWidth
      const frontPocketOpeningTopDepth = pocketMaxDepth * options.frontPocketOpeningTopDepth
      const frontPocketOpeningDepth = measurements.wrist * options.frontPocketOpeningDepth
      const frontPocketDepth = pocketMaxDepth * options.frontPocketDepth

      points.frontPocketOpeningOut = drawOutseam().shiftAlong(
        pocketMaxDepth * options.frontPocketOpeningOutDepth
      )

      points.frontPocketOpeningWaist = points.waistOut.shiftFractionTowards(
        points.waistIn,
        options.frontPocketOpeningWidth
      )

      points.frontPocketOpeningTopOut = drawOutseam().shiftAlong(frontPocketOpeningTopDepth)
      points.frontPocketOpeningBottomOut = drawOutseam().shiftAlong(
        frontPocketOpeningTopDepth + frontPocketOpeningDepth
      )

      points.frontPocketOut = drawOutseam()
        .split(
          points.frontPocketOpeningBottomOut.y < points.frontPocketOpeningOut.y
            ? points.frontPocketOpeningOut
            : points.frontPocketOpeningBottomOut
        )[1]
        .shiftAlong(frontPocketDepth)

      if (points.frontPocketOut.y > points.bottom.y) {
        points.frontPocketOut = drawOutseam().intersects(
          new Path()
            .move(points.bottom)
            .line(points.bottom.shift(180, measurements.waistToFloor * 10))
        )[0]
      }

      //stores
      store.set('pocketMaxDepth', pocketMaxDepth)

      if (complete && sa) {
        const sideSeamSa = sa * options.sideSeamSaWidth * 100
        points.saFrontPocketOpeningWaist = utils.beamsIntersect(
          points.waistIn.shiftTowards(points.waistOut, sa).rotate(-90, points.waistIn),
          points.waistOut.shiftTowards(points.waistIn, sa).rotate(90, points.waistOut),
          points.frontPocketOpeningWaist
            .shiftTowards(points.frontPocketOpeningOut, sa)
            .rotate(-90, points.frontPocketOpeningWaist),
          points.frontPocketOpeningOut
            .shiftTowards(points.frontPocketOpeningWaist, sa)
            .rotate(90, points.frontPocketOpeningOut)
        )

        points.saOutSeamStart = drawOutseam()
          .split(points.frontPocketOpeningOut)[1]
          .offset(sideSeamSa)
          .start()

        points.saFrontPocketOpeningOut = utils.beamsIntersect(
          points.saFrontPocketOpeningWaist,
          points.saFrontPocketOpeningWaist.shift(
            points.frontPocketOpeningOut.angle(points.frontPocketOpeningWaist),
            1
          ),
          points.frontPocketOpeningOut,
          points.saOutSeamStart
        )
        if (points.saFrontPocketOpeningOut.x < points.saOutSeamStart.x) {
          points.saFrontPocketOpeningOut = utils.beamsIntersect(
            points.saFrontPocketOpeningWaist,
            points.saFrontPocketOpeningWaist.shift(
              points.frontPocketOpeningOut.angle(points.frontPocketOpeningWaist),
              1
            ),
            points.saOutSeamStart,
            points.frontPocketOpeningOut.rotate(90, points.saOutSeamStart)
          )
        }
        // paths.saFrontPocketOpening = new Path()
        // .move(points.saFrontPocketOpeningWaist)
        // .line(points.saFrontPocketOpeningCorner)
        // .line(points.saFrontPocketOpeningOut)
        // .attr('class', 'fabric sa')
      }
    }
    return part
  },
}
