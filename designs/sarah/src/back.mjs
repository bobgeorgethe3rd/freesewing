import { base } from './base.mjs'

export const back = {
  name: 'sarah.back',
  from: base,
  hide: {
    from: true,
  },
  options: {
    //Constants
    cbSaWidth: 0,
    closureSaWidth: 0.015,
    sideSeamSaWidth: 0.01,
    //Fit
    fitGuides: { bool: true, menu: 'fit' },
    //Darts
    maxBackDartNum: { count: 2, min: 1, max: 2, menu: 'darts' },
    backDartLength: { pct: 65.3, min: 10, max: 100, menu: 'darts' },
    backDartPlacement: { pct: 50, min: 25, max: 75, menu: 'darts' },
    //Construction
    closurePosition: { dflt: 'back', list: ['front', 'side', 'back'], menu: 'construction' },
    hemWidth: { pct: 2, min: 0, max: 3, menu: 'construction' },
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
    const styleWaistBack = store.get('styleWaistBack')
    const waistbandWidth = store.get('waistbandWidth')
    //let's begin
    points.cbSeat = points.sideSeat.shift(0, store.get('styleSeatBack') / 2)
    points.cbWaist = new Point(points.cbSeat.x, points.origin.y)
    points.cbKnee = new Point(points.cbSeat.x, points.sideKnee.y)

    points.waistBackOrigin = utils.beamIntersectsX(
      points.sideCurveStartCp2,
      points.sideCurveStart,
      points.cbWaist.x
    )

    const waistBackRadius = points.waistBackOrigin.dist(points.cbWaist)

    points.sideWaistBack = points.waistBackOrigin.shiftTowards(
      points.sideCurveStart,
      waistBackRadius
    )

    const waistBackCpDistI =
      (4 / 3) *
      waistBackRadius *
      Math.tan(utils.deg2rad((270 - points.waistBackOrigin.angle(points.sideWaistBack)) / 4))

    points.cbWaistCp2I = points.cbWaist.shift(180, waistBackCpDistI)
    points.sideWaistBackCp1I = points.sideWaistBack
      .shiftTowards(points.waistBackOrigin, waistBackCpDistI)
      .rotate(-90, points.sideWaistBack)

    paths.waistBase = new Path()
      .move(points.cbWaist)
      .curve(points.cbWaistCp2I, points.sideWaistBackCp1I, points.sideWaistBack)
      .hide()

    const backDartWidth = paths.waistBase.length() - styleWaistBack * 0.5
    const backDartLengthI =
      (measurements.waistToSeat - measurements.waistToHips) * options.backDartLength +
      measurements.waistToHips * options.waistHeight -
      waistbandWidth

    let backDartLength = backDartLengthI
    if (backDartLengthI < (measurements.waistToSeat - measurements.waistToHips) * 0.5) {
      backDartLength = (measurements.waistToSeat - measurements.waistToHips) * 0.5
      log.warning('backDart failsafe length used')
    }

    if (
      options.maxBackDartNum == 2 &&
      !store.get('skirtBackDartPlacement') &&
      backDartWidth > paths.waistBase.length() / 8
    ) {
      //add placement for back dart options and stores
      points.backDartRight0 = paths.waistBase.shiftAlong(styleWaistBack / 6)
      points.backDartMid0 = paths.waistBase.shiftAlong(styleWaistBack / 6 + backDartWidth * 0.25)
      points.backDartLeft0 = paths.waistBase.shiftAlong(styleWaistBack / 6 + backDartWidth * 0.5)
      points.backDartBottom0 = points.waistBackOrigin.shiftOutwards(
        points.backDartMid0,
        backDartLength
      )
      points.backDartEdge0 = utils.beamsIntersect(
        points.backDartLeft0,
        points.backDartBottom0.rotate(90, points.backDartLeft0),
        points.backDartBottom0,
        points.backDartMid0
      )
      points.backDartRight1 = paths.waistBase.shiftAlong(styleWaistBack / 3 + backDartWidth * 0.5)
      points.backDartMid1 = paths.waistBase.shiftAlong(styleWaistBack / 3 + backDartWidth * 0.75)
      points.backDartLeft1 = paths.waistBase.shiftAlong(styleWaistBack / 3 + backDartWidth)
      points.backDartBottom1 = points.waistBackOrigin.shiftOutwards(
        points.backDartMid1,
        backDartLength
      )
      points.backDartEdge1 = utils.beamsIntersect(
        points.backDartLeft1,
        points.backDartBottom1.rotate(90, points.backDartLeft1),
        points.backDartBottom1,
        points.backDartMid1
      )
      //need each as placement of darts can vary
      const waistBackRightCpDist =
        (4 / 3) *
        waistBackRadius *
        Math.tan(utils.deg2rad((270 - points.waistBackOrigin.angle(points.backDartRight0)) / 4))

      const waistBackMidCpDist =
        (4 / 3) *
        waistBackRadius *
        Math.tan(
          utils.deg2rad(
            (points.waistBackOrigin.angle(points.backDartLeft0) -
              points.waistBackOrigin.angle(points.backDartRight1)) /
              4
          )
        )

      const waistBackLeftCpDist =
        (4 / 3) *
        waistBackRadius *
        Math.tan(
          utils.deg2rad(
            (points.waistBackOrigin.angle(points.backDartLeft1) -
              points.waistBackOrigin.angle(points.sideWaistBack)) /
              4
          )
        )

      points.cbWaistCp2 = points.cbWaist.shift(180, waistBackRightCpDist)
      points.backDartRight0Cp1 = points.backDartRight0
        .shiftTowards(points.waistBackOrigin, waistBackRightCpDist)
        .rotate(-90, points.backDartRight0)
      points.backDartLeft0Cp2 = points.backDartLeft0
        .shiftTowards(points.waistBackOrigin, waistBackMidCpDist)
        .rotate(90, points.backDartLeft0)
      points.backDartRight1Cp1 = points.backDartRight1
        .shiftTowards(points.waistBackOrigin, waistBackMidCpDist)
        .rotate(-90, points.backDartRight1)
      points.backDartLeft1Cp2 = points.backDartLeft1
        .shiftTowards(points.waistBackOrigin, waistBackLeftCpDist)
        .rotate(90, points.backDartLeft1)
      points.sideWaistBackCp1 = points.sideWaistBack
        .shiftTowards(points.waistBackOrigin, waistBackLeftCpDist)
        .rotate(-90, points.sideWaistBack)

      paths.waistRight = new Path()
        .move(points.cbWaist)
        .curve(points.cbWaistCp2, points.backDartRight0Cp1, points.backDartRight0)
        .hide()

      paths.waistMid = new Path()
        .move(points.backDartLeft0)
        .curve(points.backDartLeft0Cp2, points.backDartRight1Cp1, points.backDartRight1)
        .hide()

      paths.waistLeft = new Path()
        .move(points.backDartLeft1)
        .curve(points.backDartLeft1Cp2, points.sideWaistBackCp1, points.sideWaistBack)
        .hide()

      paths.waist = paths.waistRight
        .clone()
        .line(points.backDartBottom0)
        .line(points.backDartLeft0)
        .join(paths.waistMid)
        .line(points.backDartBottom1)
        .line(points.backDartLeft1)
        .join(paths.waistLeft)
        .hide()

      paths.dartEdge = new Path()
        .move(points.backDartRight0)
        .line(points.backDartEdge0)
        .line(points.backDartLeft0)
        .move(points.backDartRight1)
        .line(points.backDartEdge1)
        .line(points.backDartLeft1)
        .attr('class', 'fabric help')
    } else {
      void store.setIfUnset(
        'skirtBackDartPlacement',
        styleWaistBack * options.backDartPlacement * 0.5
      )
      points.backDartRight = paths.waistBase.shiftAlong(store.get('skirtBackDartPlacement'))
      points.backDartMid = paths.waistBase.shiftAlong(
        store.get('skirtBackDartPlacement') + backDartWidth * 0.5
      )
      points.backDartLeft = paths.waistBase.shiftAlong(
        store.get('skirtBackDartPlacement') + backDartWidth
      )
      points.backDartBottom = points.waistBackOrigin.shiftOutwards(
        points.backDartMid,
        backDartLength
      )
      points.backDartEdge = utils.beamsIntersect(
        points.backDartLeft,
        points.backDartBottom.rotate(90, points.backDartLeft),
        points.backDartBottom,
        points.backDartMid
      )

      paths.dartEdge = new Path()
        .move(points.backDartRight)
        .line(points.backDartEdge)
        .line(points.backDartLeft)
        .attr('class', 'fabric help')

      const waistBackRightCpDist =
        (4 / 3) *
        waistBackRadius *
        Math.tan(utils.deg2rad((270 - points.waistBackOrigin.angle(points.backDartRight)) / 4))

      const waistBackLeftCpDist =
        (4 / 3) *
        waistBackRadius *
        Math.tan(
          utils.deg2rad(
            (points.waistBackOrigin.angle(points.backDartLeft) -
              points.waistBackOrigin.angle(points.sideWaistBack)) /
              4
          )
        )

      points.cbWaistCp2 = points.cbWaist.shift(180, waistBackLeftCpDist)
      points.backDartRightCp1 = points.backDartRight
        .shiftTowards(points.waistBackOrigin, waistBackRightCpDist)
        .rotate(-90, points.backDartRight)
      points.backDartLeftCp2 = points.backDartLeft
        .shiftTowards(points.waistBackOrigin, waistBackLeftCpDist)
        .rotate(90, points.backDartLeft)
      points.sideWaistBackCp1 = points.sideWaistBack
        .shiftTowards(points.waistBackOrigin, waistBackLeftCpDist)
        .rotate(-90, points.sideWaistBack)

      paths.waistRight = new Path()
        .move(points.cbWaist)
        .curve(points.cbWaistCp2, points.backDartRightCp1, points.backDartRight)
        .hide()

      paths.waistLeft = new Path()
        .move(points.backDartLeft)
        .curve(points.backDartLeftCp2, points.sideWaistBackCp1, points.sideWaistBack)
        .hide()

      paths.waist = paths.waistRight
        .clone()
        .line(points.backDartBottom)
        .line(points.backDartLeft)
        .join(paths.waistLeft)
        .hide()

      log.warning('backDartWidth < paths.waistBase.length() / 8 so only drafted with one back dart')
    }

    //paths
    paths.sideSeam = new Path()
      .move(points.sideWaistBack)
      .line(points.sideCurveStart)
      .curve(points.sideCurveStartCp2, points.sideSeatCp1, points.sideSeat)
      .line(points.sideKnee)
      .hide()

    paths.seam = new Path()
      .move(points.sideKnee)
      .line(points.cbKnee)
      .line(points.cbWaist)
      .join(paths.waist)
      .join(paths.sideSeam)
      .close()
    //stores
    store.set('backDartWidth', backDartWidth)
    store.set('backDartLength', backDartLength)

    if (complete) {
      //grainline
      let titleCutNum
      if (options.closurePosition != 'back' && options.cbSaWidth == 0) {
        points.cutOnFoldFrom = points.cbWaist
        points.cutOnFoldTo = points.cbKnee
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
        titleCutNum = 1
      } else {
        points.grainlineTo = points.cbKnee.shiftFractionTowards(points.sideKnee, 0.1)
        points.grainlineFrom = new Point(points.grainlineTo.x, points.cbWaist.y)
        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
        titleCutNum = 2
      }
      //notches
      snippets.sideSeat = new Snippet('notch', points.sideSeat)
      snippets.cbSeat = new Snippet('bnotch', points.cbSeat)
      //title
      points.title = new Point(
        points.cbSeat.x * 0.43,
        points.cbSeat.shiftFractionTowards(points.cbKnee, 0.15).y
      )
      macro('title', {
        at: points.title,
        nr: '1',
        title: 'Back',
        cutNr: titleCutNum,
        scale: 2 / 3,
      })
      //scalebox
      points.scalebox = new Point(
        points.cbSeat.x * 0.5,
        points.cbSeat.shiftFractionTowards(points.cbKnee, 0.5).y
      )
      macro('scalebox', {
        at: points.scalebox,
      })
      //fitGuides
      if (options.fitGuides) {
        if (measurements.waistToHips * options.waistHeight - waistbandWidth > 0) {
          points.hipsGuideRight = points.cbWaist
            .shift(-90, measurements.waistToHips * options.waistHeight - waistbandWidth)
            .shift(180, paths.waistLeft.length() * 0.1)

          points.hipsGuideLeft = points.hipsGuideRight.shift(180, paths.waistLeft.length() * 0.8)
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
        points.seatGuideRight = points.cbSeat.shift(180, paths.waistLeft.length() * 0.1)
        points.seatGuideLeft = points.seatGuideRight.shift(180, paths.waistLeft.length() * 0.8)
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
      }
      if (points.cbSeat.dist(points.cbKnee) > measurements.waistToKnee - measurements.waistToSeat) {
        points.kneeGuideRight = points.cbSeat
          .shift(-90, measurements.waistToKnee - measurements.waistToSeat)
          .shift(180, paths.waistLeft.length() * 0.1)
        points.kneeGuideLeft = points.kneeGuideRight.shift(180, paths.waistLeft.length() * 0.8)
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
      if (sa) {
        const hemSa = sa * options.hemWidth * 100
        const closureSa = sa * options.closureSaWidth * 100
        let cbSa = sa * options.cbSaWidth * 100
        if (options.closurePosition == 'back') cbSa = closureSa
        let sideSeamSa = sa * options.sideSeamSaWidth * 100
        if (options.closurePosition == 'side') sideSeamSa = closureSa

        points.saSideKnee = points.sideKnee.translate(-sideSeamSa, hemSa)
        points.saCbKnee = points.cbKnee.translate(cbSa, hemSa)
        points.saCbWaist = points.cbWaist.translate(cbSa, -sa)

        if (
          options.maxBackDartNum == 2 &&
          !store.get('skirtBackDartPlacement') &&
          backDartWidth > paths.waistBase.length() / 8
        ) {
          points.saBackDartEdge0 = utils.beamsIntersect(
            points.backDartEdge0
              .shiftTowards(points.backDartLeft0, sa)
              .rotate(-90, points.backDartEdge0),
            points.backDartLeft0
              .shiftTowards(points.backDartEdge0, sa)
              .rotate(90, points.backDartLeft0),
            points.backDartBottom0,
            points.backDartEdge0
          )

          points.saBackDartEdge1 = utils.beamsIntersect(
            points.backDartEdge1
              .shiftTowards(points.backDartLeft1, sa)
              .rotate(-90, points.backDartEdge1),
            points.backDartLeft1
              .shiftTowards(points.backDartEdge1, sa)
              .rotate(90, points.backDartLeft1),
            points.backDartBottom1,
            points.backDartEdge1
          )

          paths.saWaist = paths.waistRight
            .offset(sa)
            .line(points.saBackDartEdge0)
            .join(paths.waistMid.offset(sa))
            .line(points.saBackDartEdge1)
            .join(paths.waistLeft.offset(sa))
            .hide()
        } else {
          points.saBackDartEdge = utils.beamsIntersect(
            points.backDartEdge
              .shiftTowards(points.backDartLeft, sa)
              .rotate(-90, points.backDartEdge),
            points.backDartLeft
              .shiftTowards(points.backDartEdge, sa)
              .rotate(90, points.backDartLeft),
            points.backDartBottom,
            points.backDartEdge
          )
          paths.saWaist = paths.waistRight
            .offset(sa)
            .line(points.saBackDartEdge)
            .join(paths.waistLeft.offset(sa))
            .hide()
        }

        points.saSideWaistBack = points.sideWaistBack
          .shift(points.sideCurveStart.angle(points.sideWaistBack), sa)
          .shift(points.sideWaistBackCp1.angle(points.sideWaistBack), sideSeamSa)

        paths.sa = new Path()
          .move(points.saSideKnee)
          .line(points.saCbKnee)
          .line(points.saCbWaist)
          .join(paths.saWaist)
          .line(points.saSideWaistBack)
          .join(paths.sideSeam.offset(sideSeamSa))
          .line(points.saSideKnee)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
