import { base } from './base.mjs'
import { back } from './back.mjs'

export const front = {
  name: 'sarah.front',
  from: base,
  after: back,
  hide: {
    from: true,
  },
  options: {
    //Constants
    cfSaWidth: 0,
    //Darts
    skirtFrontDartLength: { pct: 56.6, min: 10, max: 100, menu: 'darts' },
    skirtFrontDartPlacement: { pct: 50, min: 25, max: 75, menu: 'darts' },
    maxSkirtFrontDartNum: { count: 2, min: 1, max: 2, menu: 'darts' },
    shapeSkirtFrontDarts: { bool: false, menu: 'darts' },
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
    log,
  }) => {
    //removing paths from base
    for (let i in paths) delete paths[i]
    //measures
    const styleWaistFront = store.get('styleWaistFront')
    const waistbandWidth = store.get('waistbandWidth')
    //let's begin
    points.cfSeat = points.sideSeat.shift(180, store.get('styleSeatFront') / 2)
    points.cfWaist = new Point(points.cfSeat.x, points.origin.y)
    points.cfKnee = new Point(points.cfSeat.x, points.sideKnee.y)

    points.waistFrontOrigin = utils.beamIntersectsX(
      points.sideCurveEndCp1,
      points.sideCurveEnd,
      points.cfWaist.x
    )

    const waistFrontRadius = points.waistFrontOrigin.dist(points.cfWaist)

    points.sideWaistFront = points.waistFrontOrigin.shiftTowards(
      points.sideCurveEnd,
      waistFrontRadius
    )

    const waistFrontCpDistI =
      (4 / 3) *
      waistFrontRadius *
      Math.tan(utils.deg2rad((points.waistFrontOrigin.angle(points.sideWaistFront) - 270) / 4))

    points.sideWaistFrontCp2I = points.sideWaistFront
      .shiftTowards(points.waistFrontOrigin, waistFrontCpDistI)
      .rotate(90, points.sideWaistFront)
    points.cfWaistCp1I = points.cfWaist.shift(0, waistFrontCpDistI)

    paths.waistBase = new Path()
      .move(points.sideWaistFront)
      .curve(points.sideWaistFrontCp2I, points.cfWaistCp1I, points.cfWaist)
      .hide()

    const skirtFrontDartWidth = paths.waistBase.length() - styleWaistFront * 0.5
    const skirtFrontDartLengthI =
      (measurements.waistToSeat - measurements.waistToHips) * options.skirtFrontDartLength +
      measurements.waistToHips * options.waistHeight -
      waistbandWidth

    let skirtFrontDartLength = skirtFrontDartLengthI
    if (skirtFrontDartLengthI < (measurements.waistToSeat - measurements.waistToHips) * 0.5) {
      skirtFrontDartLength = (measurements.waistToSeat - measurements.waistToHips) * 0.5
      log.warning('skirtFrontDart failsafe length used')
    }

    if (options.maxSkirtFrontDartNum == 2 && skirtFrontDartWidth > paths.waistBase.length() / 8) {
      void store.setIfUnset(
        'skirtFrontDartPlacement',
        (styleWaistFront / 3) * (1 - options.skirtFrontDartPlacement)
      )
      points.skirtFrontDartAnchor0 = paths.waistBase.shiftAlong(
        (styleWaistFront * 0.5 - store.get('skirtFrontDartPlacement')) *
          options.skirtFrontDartPlacement +
          skirtFrontDartWidth * 0.25
      )
      points.skirtFrontDartBottom0 = points.waistFrontOrigin.shiftOutwards(
        points.skirtFrontDartAnchor0,
        skirtFrontDartLength
      )
      points.skirtFrontDartAnchor1 = paths.waistBase.shiftAlong(
        styleWaistFront * 0.5 - store.get('skirtFrontDartPlacement') + skirtFrontDartWidth * 0.75
      )
      points.skirtFrontDartBottom1 = points.waistFrontOrigin.shiftOutwards(
        points.skirtFrontDartAnchor1,
        skirtFrontDartLength
      )

      if (options.shapeSkirtFrontDarts) {
        points.skirtFrontDartRight0I = paths.waistBase.shiftAlong(
          (styleWaistFront * 0.5 - store.get('skirtFrontDartPlacement')) *
            options.skirtFrontDartPlacement
        )
        points.skirtFrontDartLeft0I = paths.waistBase.shiftAlong(
          (styleWaistFront * 0.5 - store.get('skirtFrontDartPlacement')) *
            options.skirtFrontDartPlacement +
            skirtFrontDartWidth * 0.5
        )

        points.skirtFrontDartRight1I = paths.waistBase.shiftAlong(
          styleWaistFront * 0.5 - store.get('skirtFrontDartPlacement') + skirtFrontDartWidth * 0.5
        )
        points.skirtFrontDartLeft1I = paths.waistBase.shiftAlong(
          styleWaistFront * 0.5 - store.get('skirtFrontDartPlacement') + skirtFrontDartWidth
        )

        points.waistAnchor = paths.waistBase
          .split(points.skirtFrontDartAnchor0)[1]
          .split(points.skirtFrontDartAnchor1)[0]
          .shiftFractionAlong(0.5)

        const waistDartAngle0 =
          points.skirtFrontDartBottom0.angle(points.skirtFrontDartLeft0I) -
          points.skirtFrontDartBottom0.angle(points.skirtFrontDartRight0I)
        const waistDartAngle1 =
          points.skirtFrontDartBottom1.angle(points.skirtFrontDartLeft1I) -
          points.skirtFrontDartBottom1.angle(points.skirtFrontDartRight1I)

        points.waistAnchor0 = points.waistAnchor.rotate(
          -waistDartAngle0,
          points.skirtFrontDartBottom0
        )
        points.waistFrontCpTarget0 = utils.beamsIntersect(
          points.sideWaistFront,
          points.sideWaistFrontCp2I,
          points.waistAnchor0,
          points.waistFrontOrigin
            .rotate(-waistDartAngle0, points.skirtFrontDartBottom0)
            .rotate(-90, points.waistAnchor0)
        )

        let waistFrontTweak0 = 1
        let waistFrontDelta0
        let waistTarget0 =
          paths.waistBase.split(points.skirtFrontDartRight0I)[0].length() +
          paths.waistBase
            .split(points.skirtFrontDartLeft0I)[1]
            .split(points.waistAnchor)[0]
            .length()
        do {
          points.sideWaistFrontCp2 = points.sideWaistFront.shiftFractionTowards(
            points.waistFrontCpTarget0,
            options.cpFraction * waistFrontTweak0
          )
          points.waistAnchorCp1 = points.waistAnchor0.shiftFractionTowards(
            points.waistFrontCpTarget0,
            options.cpFraction * waistFrontTweak0
          )

          paths.waistClosed0 = new Path()
            .move(points.sideWaistFront)
            .curve(points.sideWaistFrontCp2, points.waistAnchorCp1, points.waistAnchor0)
            .hide()

          waistFrontDelta0 = paths.waistClosed0.length() - waistTarget0
          if (waistFrontDelta0 > 0) waistFrontTweak0 = waistFrontTweak0 * 0.99
          else waistFrontTweak0 = waistFrontTweak0 * 1.01
        } while (Math.abs(waistFrontDelta0) > 1)

        points.skirtFrontDartRight0 = utils.lineIntersectsCurve(
          points.skirtFrontDartBottom0,
          points.skirtFrontDartBottom0.shiftFractionTowards(points.skirtFrontDartRight0I, 100),
          points.sideWaistFront,
          points.sideWaistFrontCp2,
          points.waistAnchorCp1,
          points.waistAnchor0
        )

        points.skirtFrontDartLeft0 = points.skirtFrontDartRight0.rotate(
          waistDartAngle0,
          points.skirtFrontDartBottom0
        )

        //dart1
        points.waistAnchor1 = points.waistAnchor.rotate(
          waistDartAngle1,
          points.skirtFrontDartBottom1
        )
        points.waistFrontCpTarget1 = utils.beamIntersectsY(
          points.waistAnchor1,
          points.waistFrontOrigin
            .rotate(waistDartAngle1, points.skirtFrontDartBottom1)
            .rotate(90, points.waistAnchor1),
          points.cfWaist.y
        )

        let waistFrontTweak1 = 1
        let waistFrontDelta1
        let waistTarget1 =
          paths.waistBase
            .split(points.waistAnchor)[1]
            .split(points.skirtFrontDartRight1I)[0]
            .length() + paths.waistBase.split(points.skirtFrontDartLeft1I)[1].length()
        do {
          points.waistAnchorCp2 = points.waistAnchor1.shiftFractionTowards(
            points.waistFrontCpTarget1,
            options.cpFraction * waistFrontTweak1
          )
          points.cfWaistCp1 = points.cfWaist.shiftFractionTowards(
            points.waistFrontCpTarget1,
            options.cpFraction * waistFrontTweak1
          )

          paths.waistClosed1 = new Path()
            .move(points.waistAnchor1)
            .curve(points.waistAnchorCp2, points.cfWaistCp1, points.cfWaist)
            .hide()

          waistFrontDelta1 = paths.waistClosed1.length() - waistTarget1
          if (waistFrontDelta1 > 0) waistFrontTweak1 = waistFrontTweak1 * 0.99
          else waistFrontTweak1 = waistFrontTweak1 * 1.01
        } while (Math.abs(waistFrontDelta1) > 1)

        points.skirtFrontDartLeft1 = utils.lineIntersectsCurve(
          points.skirtFrontDartBottom1,
          points.skirtFrontDartBottom1.shiftFractionTowards(points.skirtFrontDartLeft1I, 100),
          points.waistAnchor1,
          points.waistAnchorCp2,
          points.cfWaistCp1,
          points.cfWaist
        )
        points.skirtFrontDartRight1 = points.skirtFrontDartLeft1.rotate(
          -waistDartAngle1,
          points.skirtFrontDartBottom1
        )

        paths.waistClosed = new Path()
          .move(
            points.sideWaistFront
              .rotate(waistDartAngle0, points.skirtFrontDartBottom0)
              .rotate(waistDartAngle1, points.skirtFrontDartBottom1)
          )
          .curve(
            points.sideWaistFrontCp2
              .rotate(waistDartAngle0, points.skirtFrontDartBottom0)
              .rotate(waistDartAngle1, points.skirtFrontDartBottom1),
            points.waistAnchorCp1
              .rotate(waistDartAngle0, points.skirtFrontDartBottom0)
              .rotate(waistDartAngle1, points.skirtFrontDartBottom1),
            points.waistAnchor1
          )
          .join(paths.waistClosed1)
          .hide()

        paths.waistRight = paths.waistClosed0.clone().split(points.skirtFrontDartRight0)[0].hide()

        paths.waistMid = new Path()
          .move(points.sideWaistFront.rotate(waistDartAngle0, points.skirtFrontDartBottom0))
          .curve(
            points.sideWaistFrontCp2.rotate(waistDartAngle0, points.skirtFrontDartBottom0),
            points.waistAnchorCp1.rotate(waistDartAngle0, points.skirtFrontDartBottom0),
            points.waistAnchor
          )
          .split(points.skirtFrontDartLeft0)[1]
          .hide()
          .join(
            new Path()
              .move(points.waistAnchor)
              .curve(
                points.waistAnchorCp2.rotate(-waistDartAngle1, points.skirtFrontDartBottom1),
                points.cfWaistCp1.rotate(-waistDartAngle1, points.skirtFrontDartBottom1),
                points.cfWaist.rotate(-waistDartAngle1, points.skirtFrontDartBottom1)
              )
              .split(points.skirtFrontDartRight1)[0]
          )
          .hide()

        paths.waistLeft = paths.waistClosed1.clone().split(points.skirtFrontDartLeft1)[1].hide()

        paths.waist = paths.waistRight
          .clone()
          .line(points.skirtFrontDartBottom0)
          .line(points.skirtFrontDartLeft0)
          .join(paths.waistMid)
          .line(points.skirtFrontDartBottom1)
          .line(points.skirtFrontDartLeft1)
          .join(paths.waistLeft)
          .hide()
      } else {
        points.skirtFrontDartRight0 = paths.waistBase.shiftAlong(
          (styleWaistFront * 0.5 - store.get('skirtFrontDartPlacement')) *
            options.skirtFrontDartPlacement
        )
        points.skirtFrontDartLeft0 = paths.waistBase.shiftAlong(
          (styleWaistFront * 0.5 - store.get('skirtFrontDartPlacement')) *
            options.skirtFrontDartPlacement +
            skirtFrontDartWidth * 0.5
        )

        points.skirtFrontDartRight1 = paths.waistBase.shiftAlong(
          styleWaistFront * 0.5 - store.get('skirtFrontDartPlacement') + skirtFrontDartWidth * 0.5
        )
        points.skirtFrontDartLeft1 = paths.waistBase.shiftAlong(
          styleWaistFront * 0.5 - store.get('skirtFrontDartPlacement') + skirtFrontDartWidth
        )
        //need each as placement of darts can vary
        const waistFrontRightCpDist =
          (4 / 3) *
          waistFrontRadius *
          Math.tan(
            utils.deg2rad(
              (points.waistFrontOrigin.angle(points.sideWaistFront) -
                points.waistFrontOrigin.angle(points.skirtFrontDartRight0)) /
                4
            )
          )
        const waistFrontMidCpDist =
          (4 / 3) *
          waistFrontRadius *
          Math.tan(
            utils.deg2rad(
              (points.waistFrontOrigin.angle(points.skirtFrontDartLeft0) -
                points.waistFrontOrigin.angle(points.skirtFrontDartRight1)) /
                4
            )
          )
        const waistFrontLeftCpDist =
          (4 / 3) *
          waistFrontRadius *
          Math.tan(
            utils.deg2rad((points.waistFrontOrigin.angle(points.skirtFrontDartLeft1) - 270) / 4)
          )

        points.sideWaistFrontCp2 = points.sideWaistFront
          .shiftTowards(points.waistFrontOrigin, waistFrontRightCpDist)
          .rotate(90, points.sideWaistFront)
        points.skirtFrontDartRight0Cp1 = points.skirtFrontDartRight0
          .shiftTowards(points.waistFrontOrigin, waistFrontRightCpDist)
          .rotate(-90, points.skirtFrontDartRight0)
        points.skirtFrontDartLeft0Cp2 = points.skirtFrontDartLeft0
          .shiftTowards(points.waistFrontOrigin, waistFrontMidCpDist)
          .rotate(90, points.skirtFrontDartLeft0)
        points.skirtFrontDartRight1Cp1 = points.skirtFrontDartRight1
          .shiftTowards(points.waistFrontOrigin, waistFrontMidCpDist)
          .rotate(-90, points.skirtFrontDartRight1)
        points.skirtFrontDartLeft1Cp2 = points.skirtFrontDartLeft1
          .shiftTowards(points.waistFrontOrigin, waistFrontLeftCpDist)
          .rotate(90, points.skirtFrontDartLeft1)
        points.cfWaistCp1 = points.cfWaist.shift(0, waistFrontLeftCpDist)

        paths.waistRight = new Path()
          .move(points.sideWaistFront)
          .curve(
            points.sideWaistFrontCp2,
            points.skirtFrontDartRight0Cp1,
            points.skirtFrontDartRight0
          )
          .hide()

        paths.waistMid = new Path()
          .move(points.skirtFrontDartLeft0)
          .curve(
            points.skirtFrontDartLeft0Cp2,
            points.skirtFrontDartRight1Cp1,
            points.skirtFrontDartRight1
          )
          .hide()

        paths.waistLeft = new Path()
          .move(points.skirtFrontDartLeft1)
          .curve(points.skirtFrontDartLeft1Cp2, points.cfWaistCp1, points.cfWaist)
          .hide()

        paths.waist = paths.waistRight
          .clone()
          .line(points.skirtFrontDartBottom0)
          .line(points.skirtFrontDartLeft0)
          .join(paths.waistMid)
          .line(points.skirtFrontDartBottom1)
          .line(points.skirtFrontDartLeft1)
          .join(paths.waistLeft)
          .hide()
      }
      points.skirtFrontDartEdge0 = utils.beamsIntersect(
        points.skirtFrontDartLeft0,
        points.skirtFrontDartBottom0.rotate(90, points.skirtFrontDartLeft0),
        points.skirtFrontDartBottom0,
        points.waistFrontOrigin
      )
      points.skirtFrontDartEdge1 = utils.beamsIntersect(
        points.skirtFrontDartLeft1,
        points.skirtFrontDartBottom1.rotate(90, points.skirtFrontDartLeft1),
        points.skirtFrontDartBottom1,
        points.waistFrontOrigin
      )
      paths.dartEdges = new Path()
        .move(points.skirtFrontDartRight0)
        .line(points.skirtFrontDartEdge0)
        .line(points.skirtFrontDartLeft0)
        .move(points.skirtFrontDartRight1)
        .line(points.skirtFrontDartEdge1)
        .line(points.skirtFrontDartLeft1)
        .attr('class', 'fabric help')
    } else {
      void store.setIfUnset(
        'skirtFrontDartPlacement',
        styleWaistFront * options.skirtFrontDartPlacement * 0.5
      )

      points.skirtFrontDartAnchor = paths.waistBase.shiftAlong(
        styleWaistFront * 0.5 - store.get('skirtFrontDartPlacement') + skirtFrontDartWidth * 0.5
      )
      points.skirtFrontDartBottom = points.waistFrontOrigin.shiftOutwards(
        points.skirtFrontDartAnchor,
        skirtFrontDartLength
      )

      if (options.shapeSkirtFrontDarts) {
        points.skirtFrontDartRightI = paths.waistBase.shiftAlong(
          styleWaistFront * 0.5 - store.get('skirtFrontDartPlacement')
        )
        points.skirtFrontDartLeftI = paths.waistBase.shiftAlong(
          styleWaistFront * 0.5 - store.get('skirtFrontDartPlacement') + skirtFrontDartWidth
        )

        const waistDartAngle =
          points.skirtFrontDartBottom.angle(points.skirtFrontDartLeftI) -
          points.skirtFrontDartBottom.angle(points.skirtFrontDartRightI)

        points.sideWaistFrontR = points.sideWaistFront.rotate(
          waistDartAngle,
          points.skirtFrontDartBottom
        )
        points.waistFrontCpTarget = utils.beamIntersectsY(
          points.sideWaistFrontR,
          points.sideWaistFrontCp2I.rotate(waistDartAngle, points.skirtFrontDartBottom),
          points.cfWaist.y
        )

        let waistFrontTweak = 1
        let waistFrontDelta
        do {
          points.sideWaistFrontCp2 = points.sideWaistFrontR.shiftFractionTowards(
            points.waistFrontCpTarget,
            options.cpFraction * waistFrontTweak
          )
          points.cfWaistCp1 = points.cfWaist.shiftFractionTowards(
            points.waistFrontCpTarget,
            options.cpFraction * waistFrontTweak
          )

          paths.waistClosed = new Path()
            .move(points.sideWaistFrontR)
            .curve(points.sideWaistFrontCp2, points.cfWaistCp1, points.cfWaist)
            .hide()

          waistFrontDelta = paths.waistClosed.length() - styleWaistFront * 0.5
          if (waistFrontDelta > 0) waistFrontTweak = waistFrontTweak * 0.99
          else waistFrontTweak = waistFrontTweak * 1.01
        } while (Math.abs(waistFrontDelta) > 1)

        points.skirtFrontDartLeft = utils.lineIntersectsCurve(
          points.skirtFrontDartBottom,
          points.skirtFrontDartBottom.shiftFractionTowards(points.skirtFrontDartLeftI, 100),
          points.sideWaistFrontR,
          points.sideWaistFrontCp2,
          points.cfWaistCp1,
          points.cfWaist
        )

        points.skirtFrontDartRight = points.skirtFrontDartLeft.rotate(
          -waistDartAngle,
          points.skirtFrontDartBottom
        )

        paths.waistRight = new Path()
          .move(points.sideWaistFront)
          .curve(
            points.sideWaistFrontCp2.rotate(-waistDartAngle, points.skirtFrontDartBottom),
            points.cfWaistCp1.rotate(-waistDartAngle, points.skirtFrontDartBottom),
            points.cfWaist.rotate(-waistDartAngle, points.skirtFrontDartBottom)
          )
          .split(points.skirtFrontDartRight)[0]
          .hide()

        paths.waistLeft = paths.waistClosed.clone().split(points.skirtFrontDartLeft)[1].hide()

        paths.waist = paths.waistRight
          .clone()
          .line(points.skirtFrontDartBottom)
          .line(points.skirtFrontDartLeft)
          .join(paths.waistLeft)
          .hide()
      } else {
        points.skirtFrontDartRight = paths.waistBase.shiftAlong(
          styleWaistFront * 0.5 - store.get('skirtFrontDartPlacement')
        )
        points.skirtFrontDartLeft = paths.waistBase.shiftAlong(
          styleWaistFront * 0.5 - store.get('skirtFrontDartPlacement') + skirtFrontDartWidth
        )

        const waistFrontRightCpDist =
          (4 / 3) *
          waistFrontRadius *
          Math.tan(
            utils.deg2rad(
              (points.waistFrontOrigin.angle(points.sideWaistFront) -
                points.waistFrontOrigin.angle(points.skirtFrontDartRight)) /
                4
            )
          )

        const waistFrontLeftCpDist =
          (4 / 3) *
          waistFrontRadius *
          Math.tan(
            utils.deg2rad((points.waistFrontOrigin.angle(points.skirtFrontDartLeft) - 270) / 4)
          )

        points.sideWaistFrontCp2 = points.sideWaistFront
          .shiftTowards(points.waistFrontOrigin, waistFrontRightCpDist)
          .rotate(90, points.sideWaistFront)
        points.skirtFrontDartRightCp1 = points.skirtFrontDartRight
          .shiftTowards(points.waistFrontOrigin, waistFrontRightCpDist)
          .rotate(-90, points.skirtFrontDartRight)
        points.skirtFrontDartLeftCp2 = points.skirtFrontDartLeft
          .shiftTowards(points.waistFrontOrigin, waistFrontLeftCpDist)
          .rotate(90, points.skirtFrontDartLeft)
        points.cfWaistCp1 = points.cfWaist.shift(0, waistFrontLeftCpDist)

        paths.waistRight = new Path()
          .move(points.sideWaistFront)
          .curve(
            points.sideWaistFrontCp2,
            points.skirtFrontDartRightCp1,
            points.skirtFrontDartRight
          )
          .hide()

        paths.waistLeft = new Path()
          .move(points.skirtFrontDartLeft)
          .curve(points.skirtFrontDartLeftCp2, points.cfWaistCp1, points.cfWaist)
          .hide()

        paths.waist = paths.waistRight
          .clone()
          .line(points.skirtFrontDartBottom)
          .line(points.skirtFrontDartLeft)
          .join(paths.waistLeft)
          .hide()

        log.warning(
          'skirtFrontDartWidth < paths.waistBase.length() / 8 so only drafted with one front dart'
        )
      }

      points.skirtFrontDartEdge = utils.beamsIntersect(
        points.skirtFrontDartLeft,
        points.skirtFrontDartBottom.rotate(90, points.skirtFrontDartLeft),
        points.skirtFrontDartBottom,
        points.waistFrontOrigin
      )

      paths.dartEdge = new Path()
        .move(points.skirtFrontDartRight)
        .line(points.skirtFrontDartEdge)
        .line(points.skirtFrontDartLeft)
        .attr('class', 'fabric help')
    }
    //paths
    paths.sideSeam = new Path()
      .move(points.sideKnee)
      .line(points.sideSeat)
      .curve(points.sideSeatCp2, points.sideCurveEndCp1, points.sideCurveEnd)
      .line(points.sideWaistFront)
      .hide()

    paths.seam = new Path()
      .move(points.cfKnee)
      .line(points.sideKnee)
      .join(paths.sideSeam)
      .join(paths.waist)
      .line(points.cfKnee)
    //stores
    store.set('skirtFrontDartWidth', skirtFrontDartWidth)
    store.set('skirtFrontDartLength', skirtFrontDartLength)

    if (complete) {
      //grainline
      let titleCutNum
      if (options.closurePosition != 'front' && options.cfSaWidth == 0) {
        points.cutOnFoldFrom = points.cfWaist
        points.cutOnFoldTo = points.cfKnee
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
        titleCutNum = 1
      } else {
        points.grainlineTo = points.cfKnee.shiftFractionTowards(points.sideKnee, 0.1)
        points.grainlineFrom = new Point(points.grainlineTo.x, points.cfWaist.y)
        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
        titleCutNum = 2
      }
      //notches
      macro('sprinkle', {
        snippet: 'notch',
        on: ['cfSeat', 'sideSeat'],
      })
      //title
      points.title = new Point(
        points.cfSeat.x * 0.57,
        points.cfSeat.shiftFractionTowards(points.cfKnee, 0.15).y
      )
      macro('title', {
        at: points.title,
        nr: '2',
        title: 'Front',
        cutNr: titleCutNum,
        scale: 2 / 3,
      })
      //fitGuides
      if (options.fitGuides) {
        if (measurements.waistToHips * options.waistHeight - waistbandWidth > 0) {
          points.hipsGuideLeft = points.cfWaist
            .shift(-90, measurements.waistToHips * options.waistHeight - waistbandWidth)
            .shift(0, paths.waistLeft.length() * 0.1)

          points.hipsGuideRight = points.hipsGuideLeft.shift(0, paths.waistLeft.length() * 0.8)
          paths.hipsGuide = new Path()
            .move(points.hipsGuideLeft)
            .line(points.hipsGuideRight)
            .attr('class', 'various')
            .attr('data-text', 'Hips Guide')
            .attr('data-text-class', 'left')

          macro('sprinkle', {
            snippet: 'notch',
            on: ['hipsGuideLeft', 'hipsGuideRight'],
          })
        }
        points.seatGuideLeft = points.cfSeat.shift(0, paths.waistLeft.length() * 0.1)
        points.seatGuideRight = points.seatGuideLeft.shift(0, paths.waistLeft.length() * 0.8)
        paths.seatGuide = new Path()
          .move(points.seatGuideLeft)
          .line(points.seatGuideRight)
          .attr('class', 'various')
          .attr('data-text', 'Seat Guide')
          .attr('data-text-class', 'left')

        macro('sprinkle', {
          snippet: 'notch',
          on: ['seatGuideLeft', 'seatGuideRight'],
        })

        if (
          points.sideSeat.dist(points.sideKnee) >
          measurements.waistToKnee - measurements.waistToSeat
        ) {
          points.kneeGuideLeft = points.cfSeat
            .shift(-90, measurements.waistToKnee - measurements.waistToSeat)
            .shift(0, paths.waistLeft.length() * 0.1)
          points.kneeGuideRight = points.kneeGuideLeft.shift(0, paths.waistLeft.length() * 0.8)
          paths.kneeGuide = new Path()
            .move(points.kneeGuideLeft)
            .line(points.kneeGuideRight)
            .attr('class', 'various')
            .attr('data-text', 'Knee Guide')
            .attr('data-text-class', 'right')

          macro('sprinkle', {
            snippet: 'notch',
            on: ['kneeGuideLeft', 'kneeGuideRight'],
          })
        }
      }
      if (sa) {
        const hemSa = sa * options.hemWidth * 100
        const closureSa = sa * options.closureSaWidth * 100
        let cfSa = sa * options.cbSaWidth * 100
        if (options.closurePosition == 'front') cfSa = closureSa
        let sideSeamSa = sa * options.sideSeamSaWidth * 100
        if (options.closurePosition == 'side') sideSeamSa = closureSa

        points.saCfKnee = points.cfKnee.translate(-cfSa, hemSa)
        points.saSideKnee = points.sideKnee.translate(sideSeamSa, hemSa)
        points.saSideWaistFront = points.sideWaistFront
          .shift(points.sideCurveEnd.angle(points.sideWaistFront), sa)
          .shift(points.sideWaistFrontCp2.angle(points.sideWaistFront), sideSeamSa)

        if (
          options.maxSkirtFrontDartNum == 2 &&
          skirtFrontDartWidth > paths.waistBase.length() / 8
        ) {
          points.saSkirtFrontDartEdge0 = utils.beamsIntersect(
            points.skirtFrontDartEdge0
              .shiftTowards(points.skirtFrontDartLeft0, sa)
              .rotate(-90, points.skirtFrontDartEdge0),
            points.skirtFrontDartLeft0
              .shiftTowards(points.skirtFrontDartEdge0, sa)
              .rotate(90, points.skirtFrontDartLeft0),
            points.skirtFrontDartBottom0,
            points.skirtFrontDartEdge0
          )

          points.saSkirtFrontDartEdge1 = utils.beamsIntersect(
            points.skirtFrontDartEdge1
              .shiftTowards(points.skirtFrontDartLeft1, sa)
              .rotate(-90, points.skirtFrontDartEdge1),
            points.skirtFrontDartLeft1
              .shiftTowards(points.skirtFrontDartEdge1, sa)
              .rotate(90, points.skirtFrontDartLeft1),
            points.skirtFrontDartBottom1,
            points.skirtFrontDartEdge1
          )
          paths.saWaist = paths.waistRight
            .offset(sa)
            .line(points.saSkirtFrontDartEdge0)
            .join(paths.waistMid.offset(sa))
            .line(points.saSkirtFrontDartEdge1)
            .join(paths.waistLeft.offset(sa))
            .hide()
        } else {
          points.saSkirtFrontDartEdge = utils.beamsIntersect(
            points.skirtFrontDartEdge
              .shiftTowards(points.skirtFrontDartLeft, sa)
              .rotate(-90, points.skirtFrontDartEdge),
            points.skirtFrontDartLeft
              .shiftTowards(points.skirtFrontDartEdge, sa)
              .rotate(90, points.skirtFrontDartLeft),
            points.skirtFrontDartBottom,
            points.skirtFrontDartEdge
          )
          paths.saWaist = paths.waistRight
            .offset(sa)
            .line(points.saSkirtFrontDartEdge)
            .join(paths.waistLeft.offset(sa))
            .hide()
        }

        points.saCfWaist = points.cfWaist.translate(-cfSa, -sa)

        paths.sa = new Path()
          .move(points.saCfKnee)
          .line(points.saSideKnee)
          .join(paths.sideSeam.offset(sideSeamSa))
          .line(points.saSideWaistFront)
          .join(paths.saWaist)
          .line(points.saCfWaist)
          .line(points.saCfKnee)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
