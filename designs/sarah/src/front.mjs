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
    cfSaWidth: 0.01,
    //Darts
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

    paths.saWaistBase = new Path()
      .move(points.sideWaistFront)
      .curve(points.sideWaistFrontCp2I, points.cfWaistCp1I, points.cfWaist)
      .hide()

    const dartFrontWidth = paths.saWaistBase.length() - styleWaistFront * 0.5

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
      .join(paths.saWaistBase)
      .line(points.cfKnee)

    return part
  },
}
