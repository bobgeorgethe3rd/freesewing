import { flyBase } from '@freesewing/flyfront'
import { front as frontDalton } from '@freesewing/dalton'
import { pctBasedOn } from '@freesewing/core'

export const front = {
  name: 'simeon.front',
  from: frontDalton,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Imported
    ...flyBase.options,
    //Constants
    useVoidStores: false, //Locked for Simeon
    fitWaist: false, //Locked for Simeon
    legBandWidth: {
      pct: 0,
      min: 0,
      max: 0,
      snap: 5,
      ...pctBasedOn('waistToFloor'),
    }, //locked for Simeon
    legBandsBool: false, //Locked for Simeon
    calculateLegBandDiff: false, //Locked for Simeon
    useHeel: true, //Locked for Simeon
    //Fit
    waistEase: { pct: 6.4, min: 0, max: 20, menu: 'fit' }, //Altered for Simeon
    hipsEase: { pct: 5.9, min: 0, max: 20, menu: 'fit' }, //Altered for Simeon
    seatEase: { pct: 5.1, min: 0, max: 20, menu: 'fit' }, //Altered for Simeon
    kneeEase: { pct: 13.2, min: 0, max: 20, menu: 'fit' }, //Altered for Simeon
    calfEase: { pct: 13.6, min: 0, max: 20, menu: 'fit' }, //Altered for Simeon
    fitGuides: { bool: false, menu: 'fit' }, //Altered for Simeon
    //Style
    waistHeight: { pct: 0, min: 0, max: 100, menu: 'style' }, //Altered for Simeon
    waistbandWidth: {
      pct: 2.9,
      min: 1,
      max: 6,
      snap: 1.25,
      ...pctBasedOn('waistToFloor'),
      menu: 'style',
    }, //Altered for Simeon
    waistbandStyle: { dflt: 'straight', list: ['straight', 'curved'], menu: 'style' }, //Altered for Simeon
    //Pockets
    frontPocketsBool: { bool: true, menu: 'pockets' },
    frontPocketOpeningTopDepth: { pct: 13.6, min: 10, max: 20, menu: 'pockets.frontPockets' },
    frontPocketOpeningDepth: { pct: 91, min: 90, max: 110, menu: 'pockets.frontPockets' },
    //Plackets
    flyFrontBool: { bool: true, menu: 'plackets' },
    flyFrontCurved: { bool: true, menu: 'plackets' },
    //Construction
    crotchSeamSaWidth: { pct: 1, min: 1, max: 2, menu: 'construction' }, //Altered for Simeon
    inseamSaWidth: { pct: 1, min: 1, max: 3, menu: 'construction' }, //Altered for Simeon
    sideSeamSaWidth: { pct: 1, min: 1, max: 3, menu: 'construction' }, //Altered for Simeon
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
    //measures
    const waistbandWidth = store.get('waistbandWidth')
    //let's begin
    //draw guides
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
    //pockets
    if (options.frontPocketsBool) {
      //measures
      const pocketMaxDepth = measurements.waistToKnee - measurements.waistToHips - waistbandWidth
      const frontPocketOpeningTopDepth = pocketMaxDepth * options.frontPocketOpeningTopDepth
      const frontPocketOpeningDepth = measurements.wrist * options.frontPocketOpeningDepth
      // const frontPocketDepth = (pocketMaxDepth - frontPocketOpeningTopDepth - frontPocketOpeningDepth) * options.frontPocketDepth
      points.frontPocketOpeningTopOut = drawOutseam().shiftAlong(frontPocketOpeningTopDepth)
      points.frontPocketOpeningBottomOut = drawOutseam().shiftAlong(
        frontPocketOpeningTopDepth + frontPocketOpeningDepth
      )
      //stores
      store.set('pocketMaxDepth', pocketMaxDepth)
      store.set('frontPocketOpeningTopDepth', frontPocketOpeningTopDepth)
      store.set('frontPocketOpeningDepth', frontPocketOpeningDepth)
      if (complete) {
        //notches
        macro('sprinkle', {
          snippet: 'notch',
          on: ['frontPocketOpeningTopOut', 'frontPocketOpeningBottomOut'],
        })
      }
    }
    //plackets
    if (options.flyFrontBool) {
      //delete snippets
      delete snippets.crotchSeamCurveEnd
      //measures
      const flyFrontWidth = measurements.waist * options.flyFrontWidth
      const flyFrontLength =
        (measurements.crossSeamFront - measurements.waistToHips) * options.flyFrontLength
      points.flyFrontWaist = points.waistIn
        .shiftTowards(points.crotchSeamCurveEnd, measurements.waist * options.flyFrontWidth)
        .rotate(
          points.waistIn.angle(points.crotchSeamCurveEnd) - points.waistIn.angle(points.waistOut),
          points.waistIn
        )

      points.flyCrotch = paths.crotchSeam
        .reverse()
        .shiftAlong(
          measurements.waistToHips * options.waistHeight + flyFrontLength - waistbandWidth
        )

      points.flyBottomRight = utils.beamsIntersect(
        points.flyFrontWaist,
        points.flyFrontWaist.shift(points.waistIn.angle(points.crotchSeamCurveEnd), 1),
        points.flyCrotch,
        points.flyCrotch.shift(points.waistIn.angle(points.flyFrontWaist), 1)
      )

      points.flyCurveEnd = points.flyBottomRight.shiftTowards(
        points.flyFrontWaist,
        points.flyCrotch.dist(points.flyBottomRight)
      )
      points.flyCurveOrigin = utils.beamsIntersect(
        points.flyCrotch,
        points.flyBottomRight.rotate(90, points.flyCrotch),
        points.flyCurveEnd,
        points.flyBottomRight.rotate(-90, points.flyCurveEnd)
      )

      const flyCpDistance =
        (4 / 3) *
        points.flyCurveOrigin.dist(points.flyCrotch) *
        Math.tan(
          utils.deg2rad(
            (points.flyCurveOrigin.angle(points.flyBottomRight) -
              points.flyCurveOrigin.angle(points.flyCrotch)) /
              2
          )
        )

      points.flyCrotchCp2 = points.flyCrotch.shiftTowards(points.flyBottomRight, flyCpDistance)
      points.flyCurveEndCp1 = points.flyCurveEnd.shiftTowards(points.flyBottomRight, flyCpDistance)

      const drawFlyCurve = () =>
        options.flyFrontCurved
          ? new Path()
              .move(points.flyCrotch)
              .curve(points.flyCrotchCp2, points.flyCurveEndCp1, points.flyCurveEnd)
          : new Path().move(points.flyCrotch).line(points.flyBottomRight)

      paths.fauxFly = drawFlyCurve().line(points.flyFrontWaist).line(points.waistIn)
      if (complete) {
        //notches
        snippets.flyCrotch = new Snippet('notch', points.flyCrotch)
        paths.stitchingLine = paths.crotchSeam
          .split(points.flyCrotch)[1]
          .reverse()
          .attr('class', 'mark lashed')
          .attr('data-text', 'Stitching - Line')
          .attr('data-text-class', 'center')

        if (sa) {
          delete paths.sa
          const crotchSeamSa = sa * options.crotchSeamSaWidth * 100

          points.crotchSplit = paths.crotchSeam
            .offset(crotchSeamSa)
            .intersects(drawFlyCurve().offset(sa))[0]

          if (options.flyFrontCurved) {
            points.saFlyCurveEnd = drawFlyCurve().offset(sa).end()
          } else {
            points.saFlyCurveEnd = utils.beamsIntersect(
              points.flyCrotch
                .shiftTowards(points.flyBottomRight, sa)
                .rotate(-90, points.flyCrotch),
              points.flyBottomRight
                .shiftTowards(points.flyCrotch, sa)
                .rotate(90, points.flyBottomRight),
              points.flyBottomRight
                .shiftTowards(points.flyFrontWaist, sa)
                .rotate(-90, points.flyBottomRight),
              points.flyFrontWaist
                .shiftTowards(points.flyBottomRight, sa)
                .rotate(90, points.flyFrontWaist)
            )
          }

          points.saFlyFrontWaist = utils.beamsIntersect(
            points.saFlyCurveEnd,
            points.saFlyCurveEnd.shift(points.flyBottomRight.angle(points.flyFrontWaist), 1),
            points.flyFrontWaist.shiftTowards(points.waistIn, sa).rotate(-90, points.flyFrontWaist),
            points.waistIn.shiftTowards(points.flyFrontWaist, sa).rotate(90, points.waistIn)
          )

          points.saWaistIn = utils.beamsIntersect(
            points.saFlyFrontWaist,
            points.saFlyFrontWaist.shift(points.flyFrontWaist.angle(points.waistIn), 1),
            points.crotchSeamCurveEnd,
            points.waistIn
          )

          paths.sa = paths.hemBase
            .offset(sa * options.hemWidth * 100)
            .line(points.saFloorIn)
            .join(drawInseam().offset(sa * options.inseamSaWidth * 100))
            .line(points.saUpperLegIn)
            .join(paths.crotchSeam.offset(crotchSeamSa).split(points.crotchSplit)[0])
            .join(drawFlyCurve().offset(sa).split(points.crotchSplit)[1])
            .line(points.saFlyCurveEnd)
            .line(points.saFlyFrontWaist)
            .line(points.saWaistIn)
            .line(points.saWaistOut)
            .join(drawOutseam().offset(sa * options.sideSeamSaWidth * 100))
            .line(points.saFloorOut)
            .close()
            .attr('class', 'fabric sa')
        }
      }
    }

    return part
  },
}
