import { front as frontDaisy } from '@freesewing/daisy'

export const front = {
  name: 'aimee.front',
  from: frontDaisy,
  hide: {
    from: true,
    inherited: true,
  },
  measurements: ['shoulderToElbow', 'shoulderToWrist', 'wrist'],
  options: {
    //Constant
    bustDartPlacement: 'armholePitch',
    bustDartLength: 1,
    // bustDartCurve: 1,
    bustDartFraction: 0.5,
    sleeveHemWidth: 0.01,
    //Fit
    elbowEase: { pct: 10, min: 0, max: 20, menu: 'fit' },
    wristEase: { pct: 28.9, min: 0, max: 35, menu: 'fit' },
    //Style
    fitSleeves: { bool: true, menu: 'style' },
    sleeveLength: { pct: 100, min: 0, max: 100, menu: 'style' },
    sleeveLengthBonus: { pct: 0, min: -10, max: 20, menu: 'style' },
    armholeDrop: { pct: 29, min: 0, max: 35, menu: 'style' },
    underArmSleeveLength: { pct: 6.6, min: 6, max: 8, menu: 'style' },
    //Advanced
    shoulderRise: { pct: 1.6, min: 0, max: 2, menu: 'advanced' },
    underArmCurve: { pct: 100, min: 50, max: 150, menu: 'advanced' },
    fullSleeves: { bool: true, menu: 'advanced' }, //So you can control separate sleeves later without affected the bodice
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
    //removing paths and snippets not required from Bella
    for (let i in paths) delete paths[i]
    for (let i in snippets) delete snippets[i]
    //removing macros not required from Bella
    macro('title', false)
    macro('scalebox', false)
    //measures
    const shoulderRise = measurements.hpsToWaistBack * options.shoulderRise
    const shoulderToElbow = measurements.shoulderToElbow * (1 + options.sleeveLengthBonus)
    const shoulderToWrist = measurements.shoulderToWrist * (1 + options.sleeveLengthBonus)
    const wrist = measurements.wrist * (1 + options.wristEase)
    const armholeDrop = measurements.waistToArmpit * options.armholeDrop
    const underArmSleeveLength = measurements.shoulderToWrist * options.underArmSleeveLength

    //let's begin
    //armhole scaffolding
    points.shoulderRise = points.armholePitchCp2.shiftOutwards(points.shoulder, shoulderRise)
    points.armholeDrop = points.armhole.shiftTowards(points.sideWaist, armholeDrop)

    points.bodiceSleeveTopMin = utils.beamsIntersect(
      points.hps,
      points.shoulderRise,
      points.armhole,
      points.shoulderRise.rotate(
        (90 - (points.hps.angle(points.shoulderRise) - points.shoulderRise.angle(points.armhole))) *
          -1,
        points.armhole
      )
    )

    points.bodiceSleeveTopMax = points.hps.shiftOutwards(points.shoulderRise, shoulderToWrist)
    points.bodiceSleeveBottomMax = points.bodiceSleeveTopMax.shift(
      points.armholeDrop.angle(points.sideWaist),
      wrist / 2
    )
    points.bodiceSleeveBottomMin = points.armholeDrop.shiftTowards(
      points.bodiceSleeveBottomMax,
      underArmSleeveLength
    )
    points.bodiceSleeveTopMin = utils.beamsIntersect(
      points.hps,
      points.shoulderRise,
      points.bodiceSleeveBottomMin,
      points.bodiceSleeveBottomMin.shift(points.sideWaist.angle(points.armhole), 1)
    )

    if (!options.fitSleeves) {
      points.bodiceSleeveBottomMax = points.bodiceSleeveTopMax.shift(
        points.bodiceSleeveTopMin.angle(points.bodiceSleeveBottomMin),
        points.bodiceSleeveTopMin.dist(points.bodiceSleeveBottomMin)
      )
    }

    //under arm curve
    points.underArmCurveStart = points.armholeDrop.shiftTowards(
      points.sideWaist,
      underArmSleeveLength * options.underArmCurve
    )

    points.underArmCurveAnchor = utils.beamsIntersect(
      points.underArmCurveStart.shiftFractionTowards(points.bodiceSleeveBottomMin, 0.5),
      points.underArmCurveStart.rotate(
        -90,
        points.underArmCurveStart.shiftFractionTowards(points.bodiceSleeveBottomMin, 0.5)
      ),
      points.bodiceSleeveBottomMax,
      points.bodiceSleeveBottomMin
    )

    points.underArmCurveOrigin = utils.beamsIntersect(
      points.underArmCurveStart,
      points.underArmCurveAnchor.rotate(-90, points.underArmCurveStart),
      points.bodiceSleeveBottomMin,
      points.underArmCurveAnchor.rotate(90, points.bodiceSleeveBottomMin)
    )

    const underArmCurveAngle =
      points.underArmCurveOrigin.angle(points.underArmCurveStart) -
      points.underArmCurveOrigin.angle(points.bodiceSleeveBottomMin)
    const underArmCurveCpDist =
      (4 / 3) *
      points.underArmCurveOrigin.dist(points.underArmCurveStart) *
      Math.tan(utils.deg2rad(underArmCurveAngle / 4))

    points.underArmCurveStartCp2 = points.underArmCurveStart.shift(
      points.sideWaist.angle(points.armholeDrop),
      underArmCurveCpDist
    )
    points.bodiceSleeveBottomMinCp1 = points.bodiceSleeveBottomMin.shift(
      points.bodiceSleeveBottomMax.angle(points.bodiceSleeveBottomMin),
      underArmCurveCpDist
    )

    //guides
    paths.daisyGuide = new Path()
      .move(points.cfWaist)
      .line(points.waistDartLeft)
      .line(points.waistDartTip)
      .line(points.waistDartRight)
      .line(points.sideWaist)
      .line(points.armhole)
      .curve(points.armholeCp2, points.armholePitchCp1, points.bustDartBottom)
      .line(points.bust)
      .line(points.bustDartTop)
      .curve_(points.armholePitchCp2, points.shoulder)
      .line(points.hps)
      .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
      .line(points.cfWaist)
      .attr('class', 'various lashed')

    paths.anchorLine = new Path()
      .move(points.sideWaist)
      .line(points.underArmCurveStart)
      .curve(
        points.underArmCurveStartCp2,
        points.bodiceSleeveBottomMinCp1,
        points.bodiceSleeveBottomMin
      )
      .line(points.bodiceSleeveBottomMax)
      .line(points.bodiceSleeveTopMax)
      .line(points.hps)
      .line(points.bodiceSleeveTopMin)
      .line(points.bodiceSleeveBottomMin)

    //stores
    store.set('armholeDrop', armholeDrop)
    store.set('shoulderRise', shoulderRise)
    store.set('underArmSleeveLength', underArmSleeveLength)
    store.set('sleeveLengthMin', points.hps.dist(points.bodiceSleeveTopMin))
    store.set('shoulderToWrist', shoulderToWrist)
    store.set('wrist', wrist)
    store.set(
      'underArmLength',
      points.armholeDrop.dist(
        points.bodiceSleeveTopMax.shift(points.armholeDrop.angle(points.sideWaist), wrist / 2)
      )
    )
    store.set(
      'underArmCurveLength',
      new Path()
        .move(points.underArmCurveStart)
        .curve(
          points.underArmCurveStartCp2,
          points.bodiceSleeveBottomMinCp1,
          points.bodiceSleeveBottomMin
        )
        .length()
    )

    return part
  },
}
