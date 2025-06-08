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

    const dartBackWidth = paths.saWaistBase.length() - styleWaistBack * 0.5

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
      .join(paths.saWaistBase)
      .join(paths.sideSeam)
      .close()

    return part
  },
}
