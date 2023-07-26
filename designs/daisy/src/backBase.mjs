import { sharedBase } from './sharedBase.mjs'
import { frontBase } from './frontBase.mjs'

export const backBase = {
  name: 'daisy.backBase',
  from: sharedBase,
  after: frontBase,
  hide: {
    from: true,
  },
  options: {
    //Constants
    //Armhole
    backArmholePitchWidth: { pct: 97, min: 95, max: 98.5, menu: 'armhole' },
    backArmholeDepth: { pct: 55.2, min: 45, max: 65, menu: 'armhole' },
    backArmholePitchDepth: { pct: 50, min: 45, max: 65, menu: 'armhole' },
  },
  measurements: ['bustFront', 'chest'],
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
  }) => {
    //remove paths & snippets
    for (let i in paths) delete paths[i]
    //measures
    const chestBack = (measurements.chest - measurements.bustFront) * (1 + options.chestEase)
    const waistToArmhole = store.get('waistToArmhole')
    const waistBack = measurements.waistBack * (1 + options.waistEase)
    //let's begin
    points.cbArmhole = points.origin.shift(-90, measurements.hpsToWaistBack - waistToArmhole)
    points.armhole = points.cbArmhole.shift(0, chestBack / 2)
    points.cbWaist = points.origin.shift(-90, measurements.hpsToWaistBack)
    points.sideWaistAnchor = new Point(points.armhole.x, points.cbWaist.y)
    //dart
    const waistDiff = points.armhole.x - waistBack / 2

    if (waistDiff < 0) {
      points.sideWaist = points.sideWaistAnchor.shift(180, waistDiff * 2)
      points.dartTip = points.cbArmhole.shiftFractionTowards(points.armhole, 0.5)
      points.dartBottomMid = new Point(points.dartTip.x, points.cbWaist.y)
      points.dartBottomLeft = points.dartBottomMid.shift(180, waistDiff / -2)
      points.dartBottomRight = points.dartBottomLeft.flipX(points.dartBottomMid)
    } else {
      points.sideWaist = points.sideWaistAnchor.shift(180, waistDiff / 3)
      points.dartTip = points.cbArmhole.shift(0, points.sideWaist.x / 2)
      points.dartBottomMid = new Point(points.dartTip.x, points.cbWaist.y)
      points.dartBottomLeft = points.dartBottomMid.shift(180, waistDiff / 3)
      points.dartBottomRight = points.dartBottomLeft.flipX(points.dartBottomMid)
    }
    //cbNeck
    points.cbNeckCp1 = utils.beamsIntersect(
      points.hps,
      points.shoulder.rotate((180 - (points.hps.angle(points.shoulder) - 270)) * -1, points.hps),
      points.cbNeck,
      points.cbNeck.shift(0, 1)
    )

    //armhole
    points.cbArmholePitch = points.cbNeck.shiftFractionTowards(
      points.cbArmhole,
      options.backArmholePitchDepth
    )
    points.armholePitch = points.cbArmholePitch.shift(
      0,
      points.shoulder.x * options.backArmholePitchWidth
    )
    points.armholePitchCp2 = utils.beamsIntersect(
      points.armholePitch,
      points.armholePitch.shift(90, 1),
      points.shoulder,
      points.hps.rotate(90, points.shoulder)
    )
    // points.armholeCpMax = utils.beamsIntersect(
    // points.armholePitchCp2,
    // points.armholePitch,
    // points.armhole,
    // points.sideWaist.rotate(-90, points.armhole)
    // )
    points.armholePitchCp1 = points.armholePitch.shiftFractionTowards(
      new Point(points.armholePitch.x, points.armhole.y),
      options.backArmholeDepth
    )
    points.armholeCp2 = points.armhole.shiftFractionTowards(
      new Point(points.armholePitch.x, points.armhole.y),
      options.backArmholeDepth
    )

    //guides
    paths.guide = new Path()
      .move(points.cbWaist)
      .line(points.dartBottomLeft)
      .line(points.dartTip)
      .line(points.dartBottomRight)
      .line(points.sideWaist)
      .line(points.armhole)
      .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
      .curve_(points.armholePitchCp2, points.shoulder)
      .line(points.hps)
      ._curve(points.cbNeckCp1, points.cbNeck)
      .line(points.cbWaist)

    return part
  },
}
