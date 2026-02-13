import { frontBase } from './frontBase.mjs'
import { backBase } from './backBase.mjs'

export const front = {
  name: 'playtest.front',
  from: frontBase,
  after: backBase,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Style
    frontNeckDrop: { pct: 75, min: 25, max: 100, menu: 'style' },
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
  }) => {
    //remove paths & snippets
    if (options.daisyGuides) {
      const keepThese = 'daisyGuide'
      for (const name in paths) {
        if (keepThese.indexOf(name) === -1) delete paths[name]
      }
    } else {
      for (let i in paths) delete paths[i]
    }
    //let's begin
    //back armhole
    points.armholeCp2 = points.armhole.shift(
      points.sideChest.angle(points.armhole) + 90,
      points.armhole.dist(points.armholeCp2)
    )
    points.armholeCp1 = points.armholeCp2.shiftOutwards(
      points.armhole,
      store.get('backArmholeCp2Dist')
    )
    points.backArmholePitch = points.armhole.shift(
      points.armhole.angle(points.sideChest) + store.get('backArmholePitchAngleArmhole'),
      store.get('backArmholePitchDistArmhole')
    )
    points.backArmholePitchCp2 = points.armhole.shift(
      points.armhole.angle(points.sideChest) + store.get('backArmholePitchCp1Angle'),
      store.get('backArmholePitchCp1Dist')
    )

    //shoulder extension
    points.backArmholePitchShoulder = points.shoulder.shift(
      points.armholePitchCp2.angle(points.shoulder) + store.get('backArmholePitchAngleShoulder'),
      store.get('backArmholePitchDistShoulder')
    )
    points.backArmholePitchShoulderCp1 = points.shoulder.shift(
      points.armholePitchCp2.angle(points.shoulder),
      store.get('backArmholePitchCp2Dist')
    )

    paths.armholeShoulderExtension = new Path()
      .move(points.shoulder)
      ._curve(points.backArmholePitchShoulderCp1, points.backArmholePitchShoulder)
      .hide()

    points.armholeSplit = utils.curveIntersectsY(
      points.shoulder,
      points.shoulder,
      points.backArmholePitchShoulderCp1,
      points.backArmholePitchShoulder,
      points.hps.y
    )

    //paths.armholeShoulderExtension.shiftAlong(store.get('backArmholeSplitDist'))

    points.shoulderTop = points.armholeSplit.shiftFractionTowards(points.hps, options.shoulderWidth)

    //sideExtenstion & seam
    points.bottomRight = points.backArmholePitch.shift(
      points.backArmholePitch.angle(points.backArmholePitchCp2) + store.get('backBottomRightAngle'),
      store.get('backBottomRightDist')
    )
    points.backDartTip = points.backArmholePitch.shift(
      points.backArmholePitch.angle(points.backArmholePitchCp2) + store.get('backDartTipAngle'),
      store.get('backDartTipDist')
    )
    points.backCurveStart = points.backDartTip.shiftFractionTowards(points.bottomRight, 0.1)
    points.backCurveEnd = points.backDartTip.shiftFractionTowards(points.backArmholePitch, 0.1)
    //neckline
    points.cfTop = points.cfNeck.shiftFractionTowards(points.cArmhole, options.frontNeckDrop)
    points.necklineCorner = new Point(points.shoulderTop.x, points.cfTop.y)
    points.shoulderNeck = utils.beamIntersectsX(
      points.hps,
      points.shoulder,
      points.necklineCorner.x
    )
    points.necklineCurveStart = points.necklineCorner.shiftFractionTowards(points.shoulderNeck, 0.5)
    points.necklineCurveStartCp2 = points.necklineCurveStart.shiftFractionTowards(
      points.necklineCorner,
      options.cfNeck
    )

    //paths
    paths.bottom = new Path()
      .move(points.cfBottom)
      .line(points.waistDartBottomLeft)
      .line(points.waistDartTip)
      .line(points.waistDartBottomRight)
      .hide()

    const drawBottom = () =>
      options.bustDartPlacement != 'waist'
        ? paths.bottom
            .line(points.bustDartBottomLeft)
            .line(points.bustDartTip)
            .line(points.bustDartBottomRight)
        : paths.bottom

    paths.backSeam = new Path()
      .move(points.bottomRight)
      .line(points.backCurveStart)
      .curve(points.backDartTip, points.backDartTip, points.backCurveEnd)
      .line(points.backArmholePitch)
      .hide()

    paths.armhole = new Path()
      .move(points.backArmholePitch)
      .curve(points.backArmholePitchCp2, points.armholeCp1, points.armhole)
      .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
      .curve_(points.armholePitchCp2, points.shoulder)
      .join(paths.armholeShoulderExtension.split(points.armholeSplit)[0])

    paths.seam = drawBottom()
      .line(points.bottomRight)
      .join(paths.backSeam)
      .join(paths.armhole)
      .line(points.shoulderTop)
      .line(points.shoulderNeck)
      .curve(points.necklineCurveStart, points.necklineCorner, points.cfTop)

    //stores
    store.set('scyeFrontWidth', points.armhole.dist(points.armholeSplit))
    store.set(
      'scyeFrontDepth',
      points.armhole.dist(points.armholeSplit) *
        Math.sin(
          utils.deg2rad(
            points.armhole.angle(points.armholeSplit) - (points.shoulder.angle(points.hps) - 90)
          )
        )
    )
    store.set('frontArmholeLength', paths.armhole.split(points.armhole)[1].length())
    store.set(
      'frontArmholeToArmholePitch',
      new Path()
        .move(points.armhole)
        .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
        .length()
    )

    return part
  },
}
