import { back as backDaisy } from '@freesewing/daisy'
import { frontBase } from './frontBase.mjs'

export const backBase = {
  name: 'playtest.backBase',
  from: backDaisy,
  after: frontBase,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Style
    backNeckCurve: { pct: 0, min: 0, max: 100, menu: 'style' },
    //Armhole
    backArmholePitchDepth: { pct: 66.7, min: 45, max: 75, menu: 'armhole' }, //Altered for Playtest
    backArmholePitchWidth: { pct: 85, min: 80, max: 98.5, menu: 'armhole' }, //Altered for Playtest
    // shoulderDepth: { pct: 25, min: 10, max: 50, menu: 'armhole' },
    shoulderWidth: { pct: 50, min: 25, max: 75, menu: 'armhole' },
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
    const keepThese = ['seam', 'armhole']
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    if (options.daisyGuides) {
      paths.daisyGuide = paths.seam.clone().attr('class', 'various lashed')
    }
    delete paths.seam
    for (let i in snippets) delete snippets[i]
    //removing macros not required from Bella
    macro('title', false)
    //measures
    const backDartAngle =
      points.dartTip.angle(points.dartBottomRight) - points.dartTip.angle(points.dartBottomLeft)
    //let's begin
    points.sideBottom = points.armhole.shiftTowards(points.sideWaist, store.get('sideSeamLength'))
    points.bottomRight = utils.beamsIntersect(
      points.sideBottom,
      points.armhole.rotate(180 - store.get('sideSeamAngle'), points.sideBottom),
      points.dartTip,
      points.armholePitch.rotate(backDartAngle, points.dartTip)
    )
    points.bottomLeft = points.bottomRight.rotate(-backDartAngle, points.dartTip)
    points.cbBottom = new Point(points.cbNeck.x, points.bottomLeft.y)

    // points.armholeSplit = paths.armhole
    // .split(points.armholePitch)[1]
    // .shiftFractionAlong(1 - options.shoulderDepth)

    points.armholeSplitTarget = points.hps.shift(
      points.hps.angle(points.shoulder) * 2,
      points.hps.dist(points.shoulder) * 100
    )
    points.armholeSplit = utils.lineIntersectsCurve(
      points.hps,
      points.armholeSplitTarget,
      points.armholePitch,
      points.armholePitchCp2,
      points.shoulder,
      points.shoulder
    )

    points.shoulderTop = points.armholeSplit.shiftFractionTowards(points.hps, options.shoulderWidth)

    points.cbTop = utils.beamIntersectsX(
      points.shoulderTop,
      points.shoulderTop.shift(points.hps.angle(points.cbNeck), 1),
      points.cbWaist.x
    )

    points.cbTopCp1 = utils
      .beamIntersectsY(
        points.shoulderTop,
        points.armholeSplit.rotate(-90, points.shoulderTop),
        points.cbTop.y
      )
      .rotate(points.cbTop.angle(points.shoulderTop) * (1 - options.backNeckCurve), points.cbTop)

    points.armholeCp2 = points.armhole.shift(
      points.sideWaist.angle(points.armhole) + 90,
      points.armhole.dist(points.armholeCp2)
    )

    paths.test = new Path()
      .move(points.cbBottom)
      .line(points.bottomLeft)
      .line(points.armholePitch)
      .join(paths.armhole.split(points.armholePitch)[1].split(points.armholeSplit)[0])
      .line(points.shoulderTop)
      ._curve(points.cbTopCp1, points.cbTop)
      .line(points.cbBottom)

    paths.armholeBottom = new Path()
      .move(points.armhole)
      .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
    // .hide()

    paths.sideTest = paths.armholeBottom.clone().line(points.dartTip).line(points.bottomRight)
    // .hide()

    // paths.armholeTest = paths.armhole.split(points.armholeSplit)[1]

    //stores
    store.set('backArmholePitchDistArmhole', points.armhole.dist(points.armholePitch))
    store.set(
      'backArmholePitchAngleArmhole',
      points.armhole.angle(points.sideWaist) - points.armhole.angle(points.armholePitch)
    )
    store.set('backArmholeCp2Dist', points.armhole.dist(points.armholeCp2))
    store.set('backArmholePitchCp1Dist', points.armhole.dist(points.armholePitchCp1))
    store.set(
      'backArmholePitchCp1Angle',
      points.armhole.angle(points.sideWaist) - points.armhole.angle(points.armholePitchCp1)
    )
    store.set('backArmholePitchCp2Dist', points.shoulder.dist(points.armholePitchCp2))
    store.set('backArmholePitchDistShoulder', points.shoulder.dist(points.armholePitch))
    store.set(
      'backArmholePitchAngleShoulder',
      points.shoulder.angle(points.armholePitchCp2) - points.shoulder.angle(points.armholePitch)
    )
    //store.set('backArmholeSplitDist', paths.armhole.split(points.armholeSplit)[1].length())
    store.set('backBottomRightDist', points.armholePitch.dist(points.bottomRight))
    store.set(
      'backBottomRightAngle',
      points.armholePitch.angle(points.armholePitchCp1) -
        points.armholePitch.angle(points.bottomRight)
    )
    store.set('backDartTipDist', points.armholePitch.dist(points.dartTip))
    store.set(
      'backDartTipAngle',
      points.armholePitch.angle(points.armholePitchCp1) - points.armholePitch.angle(points.dartTip)
    )

    store.set('scyeBackWidth', points.armhole.dist(points.armholeSplit))
    store.set(
      'scyeBackDepth',
      points.armhole.dist(points.armholeSplit) *
        Math.sin(
          utils.deg2rad(
            points.armhole.angle(points.armholeSplit) - (points.shoulder.angle(points.hps) - 90)
          )
        )
    )
    store.set(
      'backArmholeLength',
      new Path()
        .move(points.armhole)
        .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
        .curve_(points.armholePitchCp2, points.shoulder)
        .split(points.armholeSplit)[0]
        .length()
    )
    store.set(
      'backArmholeToArmholePitch',
      new Path()
        .move(points.armhole)
        .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
        .length()
    )

    return part
  },
}
