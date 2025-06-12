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
    maxSkirtBackDartNum: { count: 2, min: 1, max: 2, menu: 'darts' },
    skirtBackDartLength: { pct: 65.3, min: 10, max: 100, menu: 'darts' },
    skirtBackDartPlacement: { pct: 50, min: 25, max: 75, menu: 'darts' },
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

    const skirtBackDartWidth = paths.waistBase.length() - styleWaistBack * 0.5
    const skirtBackDartLengthI =
      (measurements.waistToSeat - measurements.waistToHips) * options.skirtBackDartLength +
      measurements.waistToHips * options.waistHeight -
      waistbandWidth

    let skirtBackDartLength = skirtBackDartLengthI
    if (skirtBackDartLengthI < (measurements.waistToSeat - measurements.waistToHips) * 0.5) {
      skirtBackDartLength = (measurements.waistToSeat - measurements.waistToHips) * 0.5
      log.warning('skirtBackDart failsafe length used')
    }

    if (options.maxSkirtBackDartNum == 2 && skirtBackDartWidth > paths.waistBase.length() / 8) {
      void store.setIfUnset(
        'skirtBackDartPlacement',
        (styleWaistBack / 3) * (1 - options.skirtBackDartPlacement)
      )
      points.skirtBackDartRight0 = paths.waistBase.shiftAlong(store.get('skirtBackDartPlacement'))
      points.skirtBackDartMid0 = paths.waistBase.shiftAlong(
        store.get('skirtBackDartPlacement') + skirtBackDartWidth * 0.25
      )
      points.skirtBackDartLeft0 = paths.waistBase.shiftAlong(
        store.get('skirtBackDartPlacement') + skirtBackDartWidth * 0.5
      )
      points.skirtBackDartBottom0 = points.waistBackOrigin.shiftOutwards(
        points.skirtBackDartMid0,
        skirtBackDartLength
      )
      points.skirtBackDartEdge0 = utils.beamsIntersect(
        points.skirtBackDartLeft0,
        points.skirtBackDartBottom0.rotate(90, points.skirtBackDartLeft0),
        points.skirtBackDartBottom0,
        points.skirtBackDartMid0
      )
      points.skirtBackDartRight1 = paths.waistBase.shiftAlong(
        store.get('skirtBackDartPlacement') +
          (styleWaistBack * 0.5 - store.get('skirtBackDartPlacement')) *
            (1 - options.skirtBackDartPlacement) +
          skirtBackDartWidth * 0.5
      )
      points.skirtBackDartMid1 = paths.waistBase.shiftAlong(
        store.get('skirtBackDartPlacement') +
          (styleWaistBack * 0.5 - store.get('skirtBackDartPlacement')) *
            (1 - options.skirtBackDartPlacement) +
          skirtBackDartWidth * 0.75
      )
      points.skirtBackDartLeft1 = paths.waistBase.shiftAlong(
        store.get('skirtBackDartPlacement') +
          (styleWaistBack * 0.5 - store.get('skirtBackDartPlacement')) *
            (1 - options.skirtBackDartPlacement) +
          skirtBackDartWidth
      )
      points.skirtBackDartBottom1 = points.waistBackOrigin.shiftOutwards(
        points.skirtBackDartMid1,
        skirtBackDartLength
      )
      points.skirtBackDartEdge1 = utils.beamsIntersect(
        points.skirtBackDartLeft1,
        points.skirtBackDartBottom1.rotate(90, points.skirtBackDartLeft1),
        points.skirtBackDartBottom1,
        points.skirtBackDartMid1
      )
      //need each as placement of darts can vary
      const waistBackRightCpDist =
        (4 / 3) *
        waistBackRadius *
        Math.tan(
          utils.deg2rad((270 - points.waistBackOrigin.angle(points.skirtBackDartRight0)) / 4)
        )

      const waistBackMidCpDist =
        (4 / 3) *
        waistBackRadius *
        Math.tan(
          utils.deg2rad(
            (points.waistBackOrigin.angle(points.skirtBackDartLeft0) -
              points.waistBackOrigin.angle(points.skirtBackDartRight1)) /
              4
          )
        )

      const waistBackLeftCpDist =
        (4 / 3) *
        waistBackRadius *
        Math.tan(
          utils.deg2rad(
            (points.waistBackOrigin.angle(points.skirtBackDartLeft1) -
              points.waistBackOrigin.angle(points.sideWaistBack)) /
              4
          )
        )

      points.cbWaistCp2 = points.cbWaist.shift(180, waistBackRightCpDist)
      points.skirtBackDartRight0Cp1 = points.skirtBackDartRight0
        .shiftTowards(points.waistBackOrigin, waistBackRightCpDist)
        .rotate(-90, points.skirtBackDartRight0)
      points.skirtBackDartLeft0Cp2 = points.skirtBackDartLeft0
        .shiftTowards(points.waistBackOrigin, waistBackMidCpDist)
        .rotate(90, points.skirtBackDartLeft0)
      points.skirtBackDartRight1Cp1 = points.skirtBackDartRight1
        .shiftTowards(points.waistBackOrigin, waistBackMidCpDist)
        .rotate(-90, points.skirtBackDartRight1)
      points.skirtBackDartLeft1Cp2 = points.skirtBackDartLeft1
        .shiftTowards(points.waistBackOrigin, waistBackLeftCpDist)
        .rotate(90, points.skirtBackDartLeft1)
      points.sideWaistBackCp1 = points.sideWaistBack
        .shiftTowards(points.waistBackOrigin, waistBackLeftCpDist)
        .rotate(-90, points.sideWaistBack)

      paths.waistRight = new Path()
        .move(points.cbWaist)
        .curve(points.cbWaistCp2, points.skirtBackDartRight0Cp1, points.skirtBackDartRight0)
        .hide()

      paths.waistMid = new Path()
        .move(points.skirtBackDartLeft0)
        .curve(
          points.skirtBackDartLeft0Cp2,
          points.skirtBackDartRight1Cp1,
          points.skirtBackDartRight1
        )
        .hide()

      paths.waistLeft = new Path()
        .move(points.skirtBackDartLeft1)
        .curve(points.skirtBackDartLeft1Cp2, points.sideWaistBackCp1, points.sideWaistBack)
        .hide()

      paths.waist = paths.waistRight
        .clone()
        .line(points.skirtBackDartBottom0)
        .line(points.skirtBackDartLeft0)
        .join(paths.waistMid)
        .line(points.skirtBackDartBottom1)
        .line(points.skirtBackDartLeft1)
        .join(paths.waistLeft)
        .hide()

      paths.dartEdge = new Path()
        .move(points.skirtBackDartRight0)
        .line(points.skirtBackDartEdge0)
        .line(points.skirtBackDartLeft0)
        .move(points.skirtBackDartRight1)
        .line(points.skirtBackDartEdge1)
        .line(points.skirtBackDartLeft1)
        .attr('class', 'fabric help')
    } else {
      void store.setIfUnset(
        'skirtBackDartPlacement',
        styleWaistBack * options.skirtBackDartPlacement * 0.5
      )
      points.skirtBackDartRight = paths.waistBase.shiftAlong(store.get('skirtBackDartPlacement'))
      points.skirtBackDartMid = paths.waistBase.shiftAlong(
        store.get('skirtBackDartPlacement') + skirtBackDartWidth * 0.5
      )
      points.skirtBackDartLeft = paths.waistBase.shiftAlong(
        store.get('skirtBackDartPlacement') + skirtBackDartWidth
      )
      points.skirtBackDartBottom = points.waistBackOrigin.shiftOutwards(
        points.skirtBackDartMid,
        skirtBackDartLength
      )
      points.skirtBackDartEdge = utils.beamsIntersect(
        points.skirtBackDartLeft,
        points.skirtBackDartBottom.rotate(90, points.skirtBackDartLeft),
        points.skirtBackDartBottom,
        points.skirtBackDartMid
      )

      paths.dartEdge = new Path()
        .move(points.skirtBackDartRight)
        .line(points.skirtBackDartEdge)
        .line(points.skirtBackDartLeft)
        .attr('class', 'fabric help')

      const waistBackRightCpDist =
        (4 / 3) *
        waistBackRadius *
        Math.tan(utils.deg2rad((270 - points.waistBackOrigin.angle(points.skirtBackDartRight)) / 4))

      const waistBackLeftCpDist =
        (4 / 3) *
        waistBackRadius *
        Math.tan(
          utils.deg2rad(
            (points.waistBackOrigin.angle(points.skirtBackDartLeft) -
              points.waistBackOrigin.angle(points.sideWaistBack)) /
              4
          )
        )

      points.cbWaistCp2 = points.cbWaist.shift(180, waistBackLeftCpDist)
      points.skirtBackDartRightCp1 = points.skirtBackDartRight
        .shiftTowards(points.waistBackOrigin, waistBackRightCpDist)
        .rotate(-90, points.skirtBackDartRight)
      points.skirtBackDartLeftCp2 = points.skirtBackDartLeft
        .shiftTowards(points.waistBackOrigin, waistBackLeftCpDist)
        .rotate(90, points.skirtBackDartLeft)
      points.sideWaistBackCp1 = points.sideWaistBack
        .shiftTowards(points.waistBackOrigin, waistBackLeftCpDist)
        .rotate(-90, points.sideWaistBack)

      paths.waistRight = new Path()
        .move(points.cbWaist)
        .curve(points.cbWaistCp2, points.skirtBackDartRightCp1, points.skirtBackDartRight)
        .hide()

      paths.waistLeft = new Path()
        .move(points.skirtBackDartLeft)
        .curve(points.skirtBackDartLeftCp2, points.sideWaistBackCp1, points.sideWaistBack)
        .hide()

      paths.waist = paths.waistRight
        .clone()
        .line(points.skirtBackDartBottom)
        .line(points.skirtBackDartLeft)
        .join(paths.waistLeft)
        .hide()

      log.warning(
        'skirtBackDartWidth < paths.waistBase.length() / 8 so only drafted with one back dart'
      )
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
    store.set('skirtBackDartWidth', skirtBackDartWidth)
    store.set('skirtBackDartLength', skirtBackDartLength)

    if (complete) {
      //grainline
      let titleCutNum
      if (options.closurePosition != 'back' && options.cbSaWidth == 0) {
        points.cutOnFoldFrom = points.cbKnee
        points.cutOnFoldTo = points.cbWaist
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
            .shift(180, paths.waistRight.length() * 0.1)

          points.hipsGuideLeft = points.hipsGuideRight.shift(180, paths.waistRight.length() * 0.8)
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
        points.seatGuideRight = points.cbSeat.shift(180, paths.waistRight.length() * 0.1)
        points.seatGuideLeft = points.seatGuideRight.shift(180, paths.waistRight.length() * 0.8)
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
          points.kneeGuideRight = points.cbSeat
            .shift(-90, measurements.waistToKnee - measurements.waistToSeat)
            .shift(180, paths.waistRight.length() * 0.1)
          points.kneeGuideLeft = points.kneeGuideRight.shift(180, paths.waistRight.length() * 0.8)
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
        let cbSa = sa * options.cbSaWidth * 100
        if (options.closurePosition == 'back') cbSa = closureSa
        let sideSeamSa = sa * options.sideSeamSaWidth * 100
        if (options.closurePosition == 'side') sideSeamSa = closureSa

        points.saSideKnee = points.sideKnee.translate(-sideSeamSa, hemSa)
        points.saCbKnee = points.cbKnee.translate(cbSa, hemSa)
        points.saCbWaist = points.cbWaist.translate(cbSa, -sa)

        if (options.maxSkirtBackDartNum == 2 && skirtBackDartWidth > paths.waistBase.length() / 8) {
          points.saSkirtBackDartEdge0 = utils.beamsIntersect(
            points.skirtBackDartEdge0
              .shiftTowards(points.skirtBackDartLeft0, sa)
              .rotate(-90, points.skirtBackDartEdge0),
            points.skirtBackDartLeft0
              .shiftTowards(points.skirtBackDartEdge0, sa)
              .rotate(90, points.skirtBackDartLeft0),
            points.skirtBackDartBottom0,
            points.skirtBackDartEdge0
          )

          points.saSkirtBackDartEdge1 = utils.beamsIntersect(
            points.skirtBackDartEdge1
              .shiftTowards(points.skirtBackDartLeft1, sa)
              .rotate(-90, points.skirtBackDartEdge1),
            points.skirtBackDartLeft1
              .shiftTowards(points.skirtBackDartEdge1, sa)
              .rotate(90, points.skirtBackDartLeft1),
            points.skirtBackDartBottom1,
            points.skirtBackDartEdge1
          )

          paths.saWaist = paths.waistRight
            .offset(sa)
            .line(points.saSkirtBackDartEdge0)
            .join(paths.waistMid.offset(sa))
            .line(points.saSkirtBackDartEdge1)
            .join(paths.waistLeft.offset(sa))
            .hide()
        } else {
          points.saSkirtBackDartEdge = utils.beamsIntersect(
            points.skirtBackDartEdge
              .shiftTowards(points.skirtBackDartLeft, sa)
              .rotate(-90, points.skirtBackDartEdge),
            points.skirtBackDartLeft
              .shiftTowards(points.skirtBackDartEdge, sa)
              .rotate(90, points.skirtBackDartLeft),
            points.skirtBackDartBottom,
            points.skirtBackDartEdge
          )
          paths.saWaist = paths.waistRight
            .offset(sa)
            .line(points.saSkirtBackDartEdge)
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
