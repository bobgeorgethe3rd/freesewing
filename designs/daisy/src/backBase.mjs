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
    Snippet,
  }) => {
    //remove paths & snippets
    for (let i in paths) delete paths[i]
    //measures
    const chestBack = (measurements.chest - measurements.bustFront) * (1 + options.chestEase)
    const waistToArmhole = store.get('waistToArmhole')
    const waistBack = measurements.waistBack * (1 + options.waistEase)
    // const sideAngle = store.get('sideAngle')
    //let's begin
    // points.cbArmhole = points.origin.shift(-90, measurements.hpsToWaistBack - waistToArmhole)
    points.armhole = points.cArmhole.shift(0, chestBack / 2)
    points.cbWaist = points.origin.shift(-90, measurements.hpsToWaistBack)
    points.sideWaistAnchor = new Point(points.armhole.x, points.cbWaist.y)
    //dart
    // points.sideWaist = utils.beamsIntersect(
    // points.armhole,
    // points.armhole.shift(sideAngle, 1),
    // points.cbWaist,
    // points.cbWaist.shift(0, 1)
    // )
    // const waistDiff = points.sideWaist.x - waistBack / 2
    const waistDiff = points.armhole.x - waistBack / 2

    if (waistDiff < 0) {
      points.sideWaist = points.sideWaistAnchor.shift(180, waistDiff * 2)
      points.dartTip = points.cArmhole.shiftFractionTowards(points.armhole, 0.5)
      points.dartBottomMidI = new Point(points.dartTip.x, points.cbWaist.y)
      points.dartBottomLeftI = points.dartBottomMidI.shift(180, waistDiff / -2)
      points.dartBottomRightI = points.dartBottomLeftI.flipX(points.dartBottomMidI)
    } else {
      points.sideWaist = points.sideWaistAnchor.shift(180, waistDiff / 3)
      points.dartTip = points.cArmhole.shift(0, points.sideWaist.x / 2)
      points.dartBottomMidI = new Point(points.dartTip.x, points.cbWaist.y)
      points.dartBottomLeftI = points.dartBottomMidI.shift(180, waistDiff / 3)
      points.dartBottomRightI = points.dartBottomLeftI.flipX(points.dartBottomMidI)
    }
    points.dartBottomEdgeI = utils.beamsIntersect(
      points.dartBottomLeftI,
      points.dartTip.rotate(-90, points.dartBottomLeftI),
      points.dartTip,
      points.dartBottomMidI
    )

    points.dartBottomLeft = utils.lineIntersectsCurve(
      points.dartTip,
      points.dartTip.shiftFractionTowards(points.dartBottomLeftI, 2),
      points.cbWaist,
      points.dartBottomEdgeI,
      points.dartBottomEdgeI,
      points.sideWaist
    )
    points.dartBottomLeftCp1 = utils.beamsIntersect(
      points.dartBottomLeft,
      points.dartTip.rotate(90, points.dartBottomLeft),
      points.cbWaist,
      points.cbWaist.shift(0, 1)
    )
    points.dartBottomRight = points.dartBottomLeft.flipX(points.dartTip)
    points.dartBottomRightCp2 = points.dartBottomLeftCp1.flipX(points.dartTip)
    points.dartBottomEdge = utils.beamsIntersect(
      points.dartBottomLeft,
      points.dartTip.rotate(-90, points.dartBottomLeft),
      points.dartTip,
      points.dartBottomMidI
    )
    points.dartBottomMid = new Point(points.dartTip.x, points.dartBottomLeft.y)
    //cbNeck
    points.cbNeckCp1 = utils.beamsIntersect(
      points.hps,
      points.shoulder.rotate((180 - (points.hps.angle(points.shoulder) - 270)) * -1, points.hps),
      points.cbNeck,
      points.cbNeck.shift(0, 1)
    )

    //armhole
    points.cArmholePitch = points.cbNeck.shiftFractionTowards(
      points.cArmhole,
      options.backArmholePitchDepth
    )
    points.armholePitch = points.cArmholePitch.shift(
      0,
      points.shoulder.x * options.backArmholePitchWidth
    )
    points.armholePitchCp2 = utils.beamsIntersect(
      points.armholePitch,
      points.armholePitch.shift(90, 1),
      points.shoulder,
      points.hps.rotate(90, points.shoulder)
    )
    points.armholeCpMax = utils.beamsIntersect(
      points.armholePitchCp2,
      points.armholePitch,
      points.armhole,
      points.sideWaist.rotate(-90, points.armhole)
    )
    points.armholePitchCp1 = points.armholePitch.shiftFractionTowards(
      points.armholeCpMax, //new Point(points.armholePitch.x, points.armhole.y),
      options.backArmholeDepth
    )
    points.armholeCp2 = points.armhole.shiftFractionTowards(
      points.armholeCpMax, //new Point(points.armholePitch.x, points.armhole.y),
      options.backArmholeDepth
    )

    //temp snippets for testing
    snippets.armholePitch = new Snippet('bnotch', points.armholePitch)
    //guides
    paths.dart = new Path()
      .move(points.dartBottomLeft)
      .line(points.dartBottomEdgeI)
      .line(points.dartBottomRight)
      .attr('class', 'fabric help')
    paths.guide = new Path()
      .move(points.cbWaist)
      .curve_(points.dartBottomLeftCp1, points.dartBottomLeft)
      .line(points.dartTip)
      .line(points.dartBottomRight)
      ._curve(points.dartBottomRightCp2, points.sideWaist)
      .line(points.armhole)
      .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
      .curve_(points.armholePitchCp2, points.shoulder)
      .line(points.hps)
      ._curve(points.cbNeckCp1, points.cbNeck)
      .line(points.cbWaist)

    return part
  },
}
