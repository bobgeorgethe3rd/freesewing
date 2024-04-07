import { flyBase } from '@freesewing/flyfront'
import { front as frontDalton } from '@freesewing/dalton'
import { pctBasedOn } from '@freesewing/core'

export const front = {
  name: 'paul.front',
  from: frontDalton,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Imported
    ...flyBase.options,
    //Constants
    useVoidStores: false, //Locked for Paul
    waistbandStyle: 'none', //Locked for Paul
    fitWaist: false, //Locked for Paul
    calculateWaistbandDiff: false, //Locked for Paul
    legBandWidth: {
      pct: 0,
      min: 0,
      max: 0,
      snap: 5,
      ...pctBasedOn('waistToFloor'),
    }, //locked for Paul
    legBandsBool: false, //Locked for Paul
    calculateLegBandDiff: false, //Locked for Paul
    useHeel: true, //Locked for Paul
    fitKnee: false, //Locked for Paul
    //Fit
    waistEase: { pct: 6.4, min: 0, max: 20, menu: 'fit' }, //Altered for Paul
    hipsEase: { pct: 5.9, min: 0, max: 20, menu: 'fit' }, //Altered for Paul
    seatEase: { pct: 5.1, min: 0, max: 20, menu: 'fit' }, //Altered for Paul
    kneeEase: { pct: 13.2, min: 0, max: 20, menu: 'fit' }, //Altered for Paul
    fitGuides: { bool: false, menu: 'fit' }, //Altered for Paul
    //Style
    waistHeight: { pct: 0, min: 0, max: 100, menu: 'style' }, //Altered for Paul
    waistbandWidth: {
      pct: 3.7,
      min: 1,
      max: 6,
      snap: 5,
      ...pctBasedOn('waistToFloor'),
      menu: 'style',
    }, //Altered for Paul
    //Pockets
    frontPocketsBool: { bool: true, menu: 'pockets' },
    frontPocketOpeningTopDepth: { pct: 13.6, min: 10, max: 20, menu: 'pockets.frontPockets' },
    frontPocketOpeningDepth: { pct: 91, min: 90, max: 110, menu: 'pockets.frontPockets' },
    //Plackets
    flyFrontBool: { bool: true, menu: 'plackets' },
    flyFrontCurved: { bool: true, menu: 'plackets' },
    //Construction
    crotchSeamSaWidth: { pct: 1, min: 1, max: 2, menu: 'construction' }, //Altered for Paul
    inseamSaWidth: { pct: 1, min: 1, max: 3, menu: 'construction' }, //Altered for Paul
    sideSeamSaWidth: { pct: 1, min: 1, max: 3, menu: 'construction' }, //Altered for Paul
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
    //remove seam allowances
    delete paths.sa
    //measures
    const waistbandWidth = absoluteOptions.waistbandWidth
    const crotchSeamSa = sa * options.crotchSeamSaWidth * 100
    //draw guides
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
    const drawInseam = () =>
      options.fitKnee
        ? new Path()
            .move(points.floorIn)
            .curve_(points.floorInCp2, points.kneeIn)
            .curve(points.kneeInCp2, points.upperLegInCp1, points.upperLegIn)
        : new Path()
            .move(points.floorIn)
            .curve(points.floorInCp2, points.upperLegInCp1, points.upperLegIn)
    //let's begin
    points.waistbandAnchor = points.waistOut
      .shiftFractionTowards(points.waistIn, 0.5)
      .shift(points.waistIn.angle(points.waistOut) + 90, waistbandWidth)
    points.waistbandIn = utils.beamsIntersect(
      points.waistbandAnchor,
      points.waistbandAnchor.shift(points.waistOut.angle(points.waistIn), 1),
      points.waistIn,
      points.crotchSeamCurveEnd
    )
    if (points.waistbandIn.y > points.crotchSeamCurveEnd.y) {
      points.waistbandIn = utils.lineIntersectsCurve(
        points.waistbandAnchor,
        points.waistbandAnchor.shift(
          points.waistOut.angle(points.waistIn),
          points.waistOut.dist(points.waistIn) * 2
        ),
        points.upperLegIn,
        points.upperLegInCp2,
        points.crotchSeamCurveEndCp1,
        points.crotchSeamCurveEnd
      )
    }
    points.waistbandOut = drawOutseam().intersects(
      new Path()
        .move(points.waistbandAnchor)
        .line(
          points.waistbandAnchor.shift(
            points.waistIn.angle(points.waistOut),
            points.waistIn.dist(points.waistOut) * 2
          )
        )
    )[0]
    paths.waistbandOutSeam = drawOutseam().split(points.waistbandOut)[0].reverse().hide()

    macro('mirror', {
      mirror: [points.waistIn, points.waistOut],
      paths: ['waistbandOutSeam'],
      points: ['waistbandOut', 'waistbandIn'],
      prefix: 'm',
    })
    //paths
    paths.waistband = new Path()
      .move(points.waistIn)
      .line(points.mWaistbandIn)
      .line(points.mWaistbandOut)
      .join(paths.mWaistbandOutSeam)
    //pockets
    if (options.frontPocketsBool) {
      //measures
      const pocketMaxDepth = measurements.waistToKnee - measurements.waistToHips
      const frontPocketOpeningTopDepth =
        pocketMaxDepth * options.frontPocketOpeningTopDepth + waistbandWidth
      const frontPocketOpeningDepth = measurements.wrist * options.frontPocketOpeningDepth
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
      points.flyFrontWaist = points.waistbandIn
        .shiftTowards(points.crotchSeamCurveEnd, measurements.waist * options.flyFrontWidth)
        .rotate(
          points.waistIn.angle(points.crotchSeamCurveEnd) - points.waistIn.angle(points.waistOut),
          points.waistbandIn
        )

      points.flyCrotch = paths.crotchSeam
        .reverse()
        .shiftAlong(measurements.waistToHips * options.waistHeight + flyFrontLength)

      points.flyBottomRight = utils.beamsIntersect(
        points.flyFrontWaist,
        points.flyFrontWaist.shift(points.waistIn.angle(points.crotchSeamCurveEnd), 1),
        points.flyCrotch,
        points.flyCrotch.shift(points.waistbandIn.angle(points.flyFrontWaist), 1)
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

      paths.fauxFly = drawFlyCurve().line(points.flyFrontWaist).line(points.waistbandIn)
      if (complete) {
        //notches
        macro('sprinkle', {
          snippet: 'notch',
          on: ['flyCrotch', 'waistbandIn'],
        })
        paths.stitchingLine = paths.crotchSeam
          .split(points.flyCrotch)[1]
          .split(points.waistbandIn)[0]
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
            points.flyFrontWaist
              .shiftTowards(points.waistbandIn, sa)
              .rotate(-90, points.flyFrontWaist),
            points.waistbandIn.shiftTowards(points.flyFrontWaist, sa).rotate(90, points.waistbandIn)
          )

          points.saWaistbandIn = utils.beamsIntersect(
            points.saFlyFrontWaist,
            points.saFlyFrontWaist.shift(points.flyFrontWaist.angle(points.waistbandIn), 1),
            points.saWaistIn,
            points.saWaistIn.shift(points.waistIn.angle(points.crotchSeamCurveEnd), 1)
          )

          paths.saflyCrotch = paths.crotchSeam
            .clone()
            .offset(crotchSeamSa)
            .split(points.crotchSplit)[0]
            .join(drawFlyCurve().offset(sa).split(points.crotchSplit)[1])
            .line(points.saFlyCurveEnd)
            .line(points.saFlyFrontWaist)
            .line(points.saWaistbandIn)
            .hide()
        }
      }
    }
    if (complete) {
      //notches
      macro('sprinkle', {
        snippet: 'notch',
        on: ['waistOut', 'waistIn'],
      })
      //eyelet
      points.eyelet = points.waistIn
        .shift(points.waistIn.angle(points.waistOut), waistbandWidth / 2)
        .shift(points.waistIn.angle(points.waistOut) + 90, waistbandWidth / 2)
        .attr('data-circle', 3.4)
        .attr('data-circle-class', 'mark dotted stroke-lg')
      //lines
      paths.foldline = new Path()
        .move(points.waistOut)
        .line(points.waistIn)
        .attr('class', 'mark')
        .attr('data-text', 'Fold - Line')
        .attr('data-text-class', 'center')

      paths.waistbandStitchline = new Path()
        .move(points.waistbandOut)
        .line(points.waistbandIn)
        .attr('class', 'mark lashed')
        .attr('data-text', 'Stitching - Line')
        .attr('data-text-class', 'center')
      if (sa) {
        const sideSeamSa = sa * options.sideSeamSaWidth * 100
        points.saWaistIn = utils.beamsIntersect(
          points.crotchSeamCurveEnd
            .shiftTowards(points.waistIn, crotchSeamSa)
            .rotate(-90, points.crotchSeamCurveEnd),
          points.waistIn
            .shiftTowards(points.crotchSeamCurveEnd, crotchSeamSa)
            .rotate(90, points.waistIn),
          points.waistIn
            .shiftTowards(points.mWaistbandIn, crotchSeamSa)
            .rotate(-90, points.waistIn),
          points.mWaistbandIn
            .shiftTowards(points.waistIn, crotchSeamSa)
            .rotate(90, points.mWaistbandIn)
        )
        points.saMWaistbandIn = utils.beamsIntersect(
          points.saWaistIn,
          points.saWaistIn.shift(points.waistIn.angle(points.mWaistbandIn), 1),
          points.mWaistbandIn
            .shiftTowards(points.mWaistbandOut, sa)
            .rotate(-90, points.mWaistbandIn),
          points.mWaistbandOut
            .shiftTowards(points.mWaistbandIn, sa)
            .rotate(90, points.mWaistbandOut)
        )
        points.saMWaistbandOut = utils.beamsIntersect(
          points.saMWaistbandIn,
          points.saMWaistbandIn.shift(points.mWaistbandIn.angle(points.mWaistbandOut), 1),
          paths.mWaistbandOutSeam.offset(sideSeamSa).start(),
          paths.mWaistbandOutSeam.offset(sideSeamSa).shiftFractionAlong(0.005)
        )

        points.saWaistOut = utils.beamsIntersect(
          paths.mWaistbandOutSeam.offset(sideSeamSa).shiftFractionAlong(0.995),
          paths.mWaistbandOutSeam.offset(sideSeamSa).end(),
          drawOutseam().offset(sideSeamSa).start(),
          drawOutseam().offset(sideSeamSa).shiftFractionAlong(0.005)
        )

        const drawSaCrotch = () =>
          options.flyFrontBool
            ? paths.saflyCrotch
            : new Path()
                .move(points.upperLegIn)
                .curve(
                  points.upperLegInCp2,
                  points.crotchSeamCurveEndCp1,
                  points.crotchSeamCurveEnd
                )
                .offset(crotchSeamSa)

        paths.sa = paths.hemBase
          .offset(sa * options.hemWidth * 100)
          .line(points.saFloorIn)
          .join(drawInseam().offset(sa * options.inseamSaWidth * 100))
          .line(points.saUpperLegIn)
          .join(drawSaCrotch())
          .line(points.saWaistIn)
          .line(points.saMWaistbandIn)
          .line(points.saMWaistbandOut)
          .join(paths.mWaistbandOutSeam.offset(sideSeamSa))
          .line(points.saWaistOut)
          .join(drawOutseam().offset(sideSeamSa))
          .line(points.saFloorOut)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
