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
    maxFrontDartNum: { count: 2, min: 1, max: 2, menu: 'darts' },
    frontDartLength: { pct: 56.6, min: 10, max: 100, menu: 'darts' },
    frontDartPlacement: { pct: 50, min: 25, max: 75, menu: 'darts' },
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

    const frontDartWidth = paths.waistBase.length() - styleWaistFront * 0.5
    const frontDartLengthI =
      (measurements.waistToSeat - measurements.waistToHips) * options.frontDartLength +
      measurements.waistToHips * options.waistHeight -
      waistbandWidth

    let frontDartLength = frontDartLengthI
    if (frontDartLengthI < (measurements.waistToSeat - measurements.waistToHips) * 0.5) {
      frontDartLength = (measurements.waistToSeat - measurements.waistToHips) * 0.5
      log.warning('frontDart failsafe length used')
    }

    if (
      options.maxFrontDartNum == 2 &&
      !store.get('skirtFrontDartPlacement') &&
      frontDartWidth > paths.waistBase.length() / 8
    ) {
      //add placement for front dart options and stores
      points.frontDartRight0 = paths.waistBase.shiftAlong(styleWaistFront / 6)
      points.frontDartMid0 = paths.waistBase.shiftAlong(styleWaistFront / 6 + frontDartWidth * 0.25)
      points.frontDartLeft0 = paths.waistBase.shiftAlong(styleWaistFront / 6 + frontDartWidth * 0.5)
      points.frontDartBottom0 = points.waistFrontOrigin.shiftOutwards(
        points.frontDartMid0,
        frontDartLength
      )
      points.frontDartEdge0 = utils.beamsIntersect(
        points.frontDartLeft0,
        points.frontDartBottom0.rotate(90, points.frontDartLeft0),
        points.frontDartBottom0,
        points.waistFrontOrigin
      )

      points.frontDartRight1 = paths.waistBase.shiftAlong(
        styleWaistFront / 3 + frontDartWidth * 0.5
      )
      points.frontDartMid1 = paths.waistBase.shiftAlong(styleWaistFront / 3 + frontDartWidth * 0.75)
      points.frontDartLeft1 = paths.waistBase.shiftAlong(styleWaistFront / 3 + frontDartWidth)
      points.frontDartBottom1 = points.waistFrontOrigin.shiftOutwards(
        points.frontDartMid1,
        frontDartLength
      )
      points.frontDartEdge1 = utils.beamsIntersect(
        points.frontDartLeft1,
        points.frontDartBottom1.rotate(90, points.frontDartLeft1),
        points.frontDartBottom1,
        points.waistFrontOrigin
      )
      //need each as placement of darts can vary
      const waistFrontRightCpDist =
        (4 / 3) *
        waistFrontRadius *
        Math.tan(
          utils.deg2rad(
            (points.waistFrontOrigin.angle(points.sideWaistFront) -
              points.waistFrontOrigin.angle(points.frontDartRight0)) /
              4
          )
        )
      const waistFrontMidCpDist =
        (4 / 3) *
        waistFrontRadius *
        Math.tan(
          utils.deg2rad(
            (points.waistFrontOrigin.angle(points.frontDartLeft0) -
              points.waistFrontOrigin.angle(points.frontDartRight1)) /
              4
          )
        )
      const waistFrontLeftCpDist =
        (4 / 3) *
        waistFrontRadius *
        Math.tan(utils.deg2rad((points.waistFrontOrigin.angle(points.frontDartLeft1) - 270) / 4))

      points.sideWaistFrontCp2 = points.sideWaistFront
        .shiftTowards(points.waistFrontOrigin, waistFrontRightCpDist)
        .rotate(90, points.sideWaistFront)
      points.frontDartRight0Cp1 = points.frontDartRight0
        .shiftTowards(points.waistFrontOrigin, waistFrontRightCpDist)
        .rotate(-90, points.frontDartRight0)
      points.frontDartLeft0Cp2 = points.frontDartLeft0
        .shiftTowards(points.waistFrontOrigin, waistFrontMidCpDist)
        .rotate(90, points.frontDartLeft0)
      points.frontDartRight1Cp1 = points.frontDartRight1
        .shiftTowards(points.waistFrontOrigin, waistFrontMidCpDist)
        .rotate(-90, points.frontDartRight1)
      points.frontDartLeft1Cp2 = points.frontDartLeft1
        .shiftTowards(points.waistFrontOrigin, waistFrontLeftCpDist)
        .rotate(90, points.frontDartLeft1)
      points.cfWaistCp1 = points.cfWaist.shift(0, waistFrontLeftCpDist)

      paths.waistRight = new Path()
        .move(points.sideWaistFront)
        .curve(points.sideWaistFrontCp2, points.frontDartRight0Cp1, points.frontDartRight0)
        .hide()

      paths.waistMid = new Path()
        .move(points.frontDartLeft0)
        .curve(points.frontDartLeft0Cp2, points.frontDartRight1Cp1, points.frontDartRight1)
        .hide()

      paths.waistLeft = new Path()
        .move(points.frontDartLeft1)
        .curve(points.frontDartLeft1Cp2, points.cfWaistCp1, points.cfWaist)
        .hide()

      paths.waist = paths.waistRight
        .clone()
        .line(points.frontDartBottom0)
        .line(points.frontDartLeft0)
        .join(paths.waistMid)
        .line(points.frontDartBottom1)
        .line(points.frontDartLeft1)
        .join(paths.waistLeft)
        .hide()
    } else {
      void store.setIfUnset(
        'skirtFrontDartPlacement',
        styleWaistFront * options.frontDartPlacement * 0.5
      )

      points.frontDartRight = paths.waistBase.shiftAlong(
        styleWaistFront * 0.5 - store.get('skirtFrontDartPlacement')
      )
      points.frontDartMid = paths.waistBase.shiftAlong(
        styleWaistFront * 0.5 - store.get('skirtFrontDartPlacement') + frontDartWidth * 0.5
      )
      points.frontDartLeft = paths.waistBase.shiftAlong(
        styleWaistFront * 0.5 - store.get('skirtFrontDartPlacement') + frontDartWidth
      )
      points.frontDartBottom = points.waistFrontOrigin.shiftOutwards(
        points.frontDartMid,
        frontDartLength
      )
      points.frontDartEdge = utils.beamsIntersect(
        points.frontDartLeft,
        points.frontDartBottom.rotate(90, points.frontDartLeft),
        points.frontDartBottom,
        points.waistFrontOrigin
      )

      paths.dartEdge = new Path()
        .move(points.frontDartRight)
        .line(points.frontDartEdge)
        .line(points.frontDartLeft)
        .attr('class', 'fabric help')

      const waistFrontRightCpDist =
        (4 / 3) *
        waistFrontRadius *
        Math.tan(
          utils.deg2rad(
            (points.waistFrontOrigin.angle(points.sideWaistFront) -
              points.waistFrontOrigin.angle(points.frontDartRight)) /
              4
          )
        )

      const waistFrontLeftCpDist =
        (4 / 3) *
        waistFrontRadius *
        Math.tan(utils.deg2rad((points.waistFrontOrigin.angle(points.frontDartLeft) - 270) / 4))

      points.sideWaistFrontCp2 = points.sideWaistFront
        .shiftTowards(points.waistFrontOrigin, waistFrontRightCpDist)
        .rotate(90, points.sideWaistFront)
      points.frontDartRightCp1 = points.frontDartRight
        .shiftTowards(points.waistFrontOrigin, waistFrontRightCpDist)
        .rotate(-90, points.frontDartRight)
      points.frontDartLeftCp2 = points.frontDartLeft
        .shiftTowards(points.waistFrontOrigin, waistFrontLeftCpDist)
        .rotate(90, points.frontDartLeft)
      points.cfWaistCp1 = points.cfWaist.shift(0, waistFrontLeftCpDist)

      paths.waistRight = new Path()
        .move(points.sideWaistFront)
        .curve(points.sideWaistFrontCp2, points.frontDartRightCp1, points.frontDartRight)
        .hide()

      paths.waistLeft = new Path()
        .move(points.frontDartLeft)
        .curve(points.frontDartLeftCp2, points.cfWaistCp1, points.cfWaist)
        .hide()

      paths.waist = paths.waistRight
        .clone()
        .line(points.frontDartBottom)
        .line(points.frontDartLeft)
        .join(paths.waistLeft)
        .hide()

      log.warning(
        'frontDartWidth < paths.waistBase.length() / 8 so only drafted with one front dart'
      )
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
    store.set('frontDartWidth', frontDartWidth)
    store.set('frontDartLength', frontDartLength)

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
          options.maxFrontDartNum == 2 &&
          !store.get('skirtFrontDartPlacement') &&
          frontDartWidth > paths.waistBase.length() / 8
        ) {
          points.saFrontDartEdge0 = utils.beamsIntersect(
            points.frontDartEdge0
              .shiftTowards(points.frontDartLeft0, sa)
              .rotate(-90, points.frontDartEdge0),
            points.frontDartLeft0
              .shiftTowards(points.frontDartEdge0, sa)
              .rotate(90, points.frontDartLeft0),
            points.frontDartBottom0,
            points.frontDartEdge0
          )

          points.saFrontDartEdge1 = utils.beamsIntersect(
            points.frontDartEdge1
              .shiftTowards(points.frontDartLeft1, sa)
              .rotate(-90, points.frontDartEdge1),
            points.frontDartLeft1
              .shiftTowards(points.frontDartEdge1, sa)
              .rotate(90, points.frontDartLeft1),
            points.frontDartBottom1,
            points.frontDartEdge1
          )
          paths.saWaist = paths.waistRight
            .offset(sa)
            .line(points.saFrontDartEdge0)
            .join(paths.waistMid.offset(sa))
            .line(points.saFrontDartEdge1)
            .join(paths.waistLeft.offset(sa))
            .hide()
        } else {
          points.saFrontDartEdge = utils.beamsIntersect(
            points.frontDartEdge
              .shiftTowards(points.frontDartLeft, sa)
              .rotate(-90, points.frontDartEdge),
            points.frontDartLeft
              .shiftTowards(points.frontDartEdge, sa)
              .rotate(90, points.frontDartLeft),
            points.frontDartBottom,
            points.frontDartEdge
          )
          paths.saWaist = paths.waistRight
            .offset(sa)
            .line(points.saFrontDartEdge)
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
