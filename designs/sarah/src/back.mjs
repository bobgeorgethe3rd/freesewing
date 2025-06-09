import { base } from './base.mjs'

export const back = {
  name: 'sarah.back',
  from: base,
  hide: {
    from: true,
  },
  options: {
    //Constants
    cbSaWidth: 0.01,
    closureSaWidth: 0.015,
    sideSeamSaWidth: 0.01,
    //Fit
    fitGuides: { bool: true, menu: 'fit' },
    //Darts
    maxBackDartNum: { count: 2, min: 1, max: 2, menu: 'darts' },
    backDartLength: { pct: 65.3, min: 10, max: 100, menu: 'darts' },
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

    paths.saWaistBase = new Path()
      .move(points.cbWaist)
      .curve(points.cbWaistCp2I, points.sideWaistBackCp1I, points.sideWaistBack)
      .hide()

    const backDartWidth = paths.saWaistBase.length() - styleWaistBack * 0.5
    const backDartLengthI =
      (measurements.waistToSeat - measurements.waistToHips) * options.backDartLength +
      measurements.waistToHips * options.waistHeight -
      store.get('waistbandWidth')

    let backDartLength = backDartLengthI
    if (backDartLengthI < (measurements.waistToSeat - measurements.waistToHips) * 0.5) {
      backDartLength = (measurements.waistToSeat - measurements.waistToHips) * 0.5
      log.warning('backDart failsafe length used')
    }

    if (options.maxBackDartNum == 2 && !store.get('skirtBackDartPlacement')) {
      //add placement for back dart options and stores
      points.backDartMid0 = paths.saWaistBase.shiftFractionAlong(1 / 3)
      points.backDartRight0 = paths.saWaistBase.shiftAlong(
        (paths.saWaistBase.length() * 1) / 3 - backDartWidth * 0.25
      )
      points.backDartLeft0 = paths.saWaistBase.shiftAlong(
        (paths.saWaistBase.length() * 1) / 3 + backDartWidth * 0.25
      )
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
      points.backDartMid1 = paths.saWaistBase.shiftFractionAlong(2 / 3)
      points.backDartRight1 = paths.saWaistBase.shiftAlong(
        (paths.saWaistBase.length() * 2) / 3 - backDartWidth * 0.25
      )
      points.backDartLeft1 = paths.saWaistBase.shiftAlong(
        (paths.saWaistBase.length() * 2) / 3 + backDartWidth * 0.25
      )
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

      paths.saWaistLeft = new Path()
        .move(points.cbWaist)
        .curve(points.cbWaistCp2, points.backDartRight0Cp1, points.backDartRight0)
        .hide()

      paths.saWaistMid = new Path()
        .move(points.backDartLeft0)
        .curve(points.backDartLeft0Cp2, points.backDartRight1Cp1, points.backDartRight1)
        .hide()

      paths.saWaistRight = new Path()
        .move(points.backDartLeft1)
        .curve(points.backDartLeft1Cp2, points.sideWaistBackCp1, points.sideWaistBack)
        .hide()

      paths.waist = paths.saWaistLeft
        .clone()
        .line(points.backDartBottom0)
        .line(points.backDartLeft0)
        .join(paths.saWaistMid)
        .line(points.backDartBottom1)
        .line(points.backDartLeft1)
        .join(paths.saWaistRight)
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

    return part
  },
}
