import { front as frontDaisy } from '@freesewing/daisy'

export const front = {
  name: 'aimee.front',
  from: frontDaisy,
  hide: {
    from: true,
    inherited: true,
  },
  measurements: ['shoulderToWrist', 'shoulderToElbow', 'elbow', 'wrist'],
  options: {
    //Constant
    bustDartPlacement: 'armholePitch',
    bustDartLength: 1,
    // bustDartCurve: 1,
    bustDartFraction: 0.5,
    sleeveHemWidth: 0.01,
    //Fit
    elbowEase: { pct: 10, min: 0, max: 20, menu: 'fit' },
    wristEase: { pct: 10, min: 0, max: 20, menu: 'fit' },
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
    const elbow = measurements.elbow * (1 + options.elbowEase)
    const wrist = measurements.wrist * (1 + options.wristEase)
    const armholeDrop = measurements.waistToArmpit * options.armholeDrop
    const underArmSleeveLength = measurements.shoulderToWrist * options.underArmSleeveLength

    //let's begin
    points.shoulderRise = points.armholePitchCp2.shiftOutwards(points.shoulder, shoulderRise)
    points.armholeDrop = points.armhole.shiftTowards(points.sideWaist, armholeDrop)

    points.bodiceSleeveBottomMin = points.armholeDrop.shift(
      points.sideWaist.angle(points.armhole) - 90,
      // points.hps.angle(points.shoulderRise),
      // points.armholeCp2.angle(points.armhole),
      underArmSleeveLength
    )

    points.bodiceSleeveTopMin = utils.beamsIntersect(
      points.hps,
      points.shoulderRise,
      points.bodiceSleeveBottomMin,
      points.bodiceSleeveBottomMin.shift(points.hps.angle(points.shoulderRise) + 90, 1)
    )

    const sleeveMaxWidth = points.bodiceSleeveBottomMin.dist(points.bodiceSleeveTopMin) * 2
    const toElbow = shoulderToElbow - points.shoulderRise.dist(points.bodiceSleeveTopMin)
    const elbowToWrist = shoulderToWrist - shoulderToElbow
    let sleeveWidth
    if (options.fitSleeves) {
      sleeveWidth = sleeveMaxWidth * (1 - options.sleeveLength) + wrist * options.sleeveLength
    } else {
      sleeveWidth = sleeveMaxWidth
    }
    let sleeveLength
    if (options.sleeveLength < 0.5) {
      sleeveLength = toElbow * (2 * options.sleeveLength)
    } else {
      sleeveLength = toElbow + elbowToWrist * (2 * options.sleeveLength - 1)
    }

    if (options.fullSleeves) {
      points.bodiceSleeveTop = points.bodiceSleeveTopMin.shift(
        points.hps.angle(points.bodiceSleeveTopMin),
        sleeveLength
      )
      points.bodiceSleeveBottom = points.bodiceSleeveTop
        .shiftTowards(points.hps, sleeveWidth / 2)
        .rotate(90, points.bodiceSleeveTop)
    } else {
      points.bodiceSleeveTop = points.bodiceSleeveTopMin
      points.bodiceSleeveBottom = points.bodiceSleeveBottomMin
    }

    // if (options.fullSleeves && options.sleeveLength > 0) {
    // points.underArmCurveAnchor = utils.beamsIntersect(
    // points.armhole,
    // points.sideWaist,
    // points.bodiceSleeveBottom,
    // points.bodiceSleeveBottomMin
    // )
    // } else {
    // points.underArmCurveAnchor = utils.beamsIntersect(
    // points.armhole,
    // points.sideWaist,
    // points.bodiceSleeveBottomMin,
    // points.bodiceSleeveTopMin.rotate(90, points.bodiceSleeveBottomMin)
    // )
    // }
    if (!options.fitSleeves || !options.fullSleeves || options.sleeveLength == 0) {
      points.underArmCurveAnchor = utils.beamsIntersect(
        points.armhole,
        points.sideWaist,
        points.bodiceSleeveBottom,
        points.bodiceSleeveBottom.shift(points.bodiceSleeveTop.angle(points.hps), 1)
      )
    } else {
      points.underArmCurveAnchor = utils.beamsIntersect(
        points.armhole,
        points.sideWaist,
        points.bodiceSleeveBottomMin,
        points.bodiceSleeveBottomMin.shift(points.sideWaist.angle(points.armhole) + 90, 1)
      )
    }

    points.underArmCurveStart = points.underArmCurveAnchor.shiftTowards(
      points.sideWaist,
      points.underArmCurveAnchor.dist(points.bodiceSleeveBottomMin) * options.underArmCurve
    )
    if (points.underArmCurveStart.y > points.sideWaist.y) {
      points.underArmCurveStart = points.sideWaist
    }
    points.underArmCurveOrigin = utils.beamsIntersect(
      points.underArmCurveAnchor.rotate(-90, points.underArmCurveStart),
      points.underArmCurveStart,
      points.underArmCurveAnchor.rotate(90, points.bodiceSleeveBottomMin),
      points.bodiceSleeveBottomMin
    )

    const underArmRadius = points.underArmCurveOrigin.dist(points.underArmCurveStart)
    const underArmAngle =
      points.underArmCurveOrigin.angle(points.underArmCurveStart) -
      points.underArmCurveOrigin.angle(points.bodiceSleeveBottomMin)
    const underArmCpDist = (4 / 3) * underArmRadius * Math.tan(utils.deg2rad(underArmAngle) / 4)

    points.underArmCurveCp2 = points.underArmCurveStart
      .shiftTowards(points.underArmCurveOrigin, underArmCpDist * options.underArmCurve)
      .rotate(90, points.underArmCurveStart)
    if (points.underArmCurveCp2.y < points.underArmCurveAnchor.y) {
      points.underArmCurveCp2 = points.underArmCurveAnchor
    }
    points.bodiceSleeveBottomCp1 = points.bodiceSleeveBottomMin
      .shiftTowards(points.underArmCurveOrigin, underArmCpDist * options.underArmCurve)
      .rotate(-90, points.bodiceSleeveBottomMin)

    //guides

    // paths.daisyGuide = new Path()
    // .move(points.cfWaist)
    // .line(points.waistDartLeft)
    // .line(points.waistDartTip)
    // .line(points.waistDartRight)
    // .line(points.sideWaist)
    // .line(points.armhole)
    // .curve(points.armholeCp2, points.armholePitchCp1, points.bustDartBottom)
    // .line(points.bust)
    // .line(points.bustDartTop)
    // .curve_(points.armholePitchCp2, points.shoulder)
    // .line(points.hps)
    // .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
    // .line(points.cfWaist)
    // .attr('class', 'various lashed')

    // paths.sleeveMin = new Path()
    // .move(points.bodiceSleeveBottomMin)
    // .line(points.bodiceSleeveTopMin)

    // paths.armScaffold = new Path()
    // .move(points.bodiceSleeveBottomMin)
    // .line(points.bodiceSleeveBottom)
    // .line(points.bodiceSleeveTop)
    // .line(points.hps)

    // paths.underArmCurve = new Path()
    // .move(points.sideWaist)
    // .line(points.underArmCurveStart)
    // .curve(points.underArmCurveCp2, points.bodiceSleeveBottomCp1, points.bodiceSleeveBottomMin)

    //seam paths
    paths.hemLeft = new Path().move(points.cfWaist).line(points.waistDartLeft).hide()

    paths.waistDart = new Path()
      .move(points.waistDartLeft)
      .line(points.waistDartTip)
      .line(points.waistDartRight)
      .hide()

    paths.hemRight = new Path().move(points.waistDartRight).line(points.sideWaist).hide()

    paths.underArm = new Path()
      .move(points.sideWaist)
      .line(points.underArmCurveStart)
      .curve(points.underArmCurveCp2, points.bodiceSleeveBottomCp1, points.bodiceSleeveBottomMin)
      .hide()

    if (options.fullSleeves && options.sleeveLength > 0) {
      paths.underArm.line(points.bodiceSleeveBottom).hide()
    }

    paths.sleeveHem = new Path().move(points.bodiceSleeveBottom).line(points.bodiceSleeveTop).hide()

    paths.shoulder = new Path().move(points.bodiceSleeveTop).line(points.hps).hide()

    paths.cfNeck = new Path()
      .move(points.hps)
      .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
      .hide()

    paths.seam = paths.hemLeft
      .clone()
      .join(paths.waistDart)
      .join(paths.hemRight)
      .join(paths.underArm)
      .join(paths.sleeveHem)
      .join(paths.shoulder)
      .join(paths.cfNeck)
      .line(points.cfWaist)

    //Stores
    store.set('shoulderRise', shoulderRise)
    store.set('wrist', wrist)
    store.set('sleeveWidth', sleeveWidth)
    store.set('sleeveMaxWidth', sleeveMaxWidth)
    store.set('sleeveLength', points.hps.dist(points.bodiceSleeveTop))
    store.set('sleeveMaxLength', toElbow + elbowToWrist)
    store.set('shoulderWidth', points.hps.dist(points.bodiceSleeveTopMin))
    store.set(
      'underArmMaxLength',
      Math.sqrt(
        Math.pow(store.get('sleeveMaxLength'), 2) +
          Math.pow((store.get('sleeveMaxWidth') - store.get('wrist')) / 2, 2)
      )
    )
    store.set('underArmCurveStart', points.sideWaist.dist(points.underArmCurveStart))
    store.set('underArmCurveAnchor', points.sideWaist.dist(points.underArmCurveAnchor))
    store.set('underArmCurveCp2', points.sideWaist.dist(points.underArmCurveCp2))
    store.set(
      'bodiceSleeveBottomCp1',
      points.underArmCurveAnchor.dist(points.bodiceSleeveBottomCp1)
    )
    store.set('bodiceSleeveBottomMin', points.armholeDrop.dist(points.bodiceSleeveBottomMin))
    store.set(
      'bodiceSleeveBottomAngle',
      points.underArmCurveAnchor.angle(points.bodiceSleeveBottomMin) -
        points.underArmCurveAnchor.angle(points.sideWaist)
    )

    if (complete) {
      //grainline
      points.cutOnFoldFrom = points.cfNeck
      points.cutOnFoldTo = points.cfWaist
      macro('cutonfold', {
        from: points.cutOnFoldFrom,
        to: points.cutOnFoldTo,
        grainline: true,
      })
      //notches
      macro('sprinkle', {
        snippet: 'notch',
        on: ['cfChest', 'bust', 'underArmCurveStart'],
      })
      if (options.fullSleeves && options.sleeveLength > 0) {
        snippets.bodiceSleeveBottomMin = new Snippet('notch', points.bodiceSleeveBottomMin)
      }
      //title
      points.title = new Point(points.waistDartLeft.x, points.waistDartTip.y / 2)
      macro('title', {
        at: points.title,
        nr: '1',
        title: 'front',
        scale: 2 / 3,
      })
      //scalebox
      points.scalebox = new Point(points.title.x * 1.15, points.waistDartTip.y * (17 / 24))
      macro('scalebox', { at: points.scalebox })
      //dart
      paths.darts = new Path()
        .move(points.waistDartLeft)
        .line(points.waistDartEdge)
        .line(points.waistDartRight)
        .attr('class', 'fabric help')

      if (sa) {
        const neckSa = sa * options.neckSaWidth * 100
        const sleeveHem = sa * options.sleeveHemWidth * 100
        const sideSeamSa = sa * options.sideSeamSaWidth * 100
        const shoulderSa = sa * options.shoulderSaWidth * 100

        points.saPoint3 = points.bodiceSleeveTop
          .shift(points.hps.angle(points.bodiceSleeveTop), sleeveHem)
          .shift(points.hps.angle(points.bodiceSleeveTop) + 90, shoulderSa)

        points.saPoint2 = utils.beamsIntersect(
          points.bodiceSleeveBottom
            .shiftTowards(points.bodiceSleeveBottomCp1, sideSeamSa)
            .rotate(90, points.bodiceSleeveBottom),
          points.bodiceSleeveBottomCp1
            .shiftTowards(points.bodiceSleeveBottom, sideSeamSa)
            .rotate(-90, points.bodiceSleeveBottomCp1),
          points.saPoint3,
          points.saPoint3.shift(points.bodiceSleeveTop.angle(points.bodiceSleeveBottom), 1)
        )

        points.saPoint4 = points.saPoint5

        paths.sa = paths.hemLeft
          .offset(sa)
          .line(points.saPoint0)
          .line(paths.hemRight.offset(sa).start())
          .join(paths.hemRight.offset(sa))
          .line(points.saPoint1)
          .join(paths.underArm.offset(sideSeamSa))
          .line(points.saPoint2)
          .line(points.saPoint3)
          .line(points.saPoint4)
          .join(paths.cfNeck.offset(neckSa))
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
