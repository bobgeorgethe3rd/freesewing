import { frontBase } from '@freesewing/daisy'
import { back as backDaisy } from '@freesewing/daisy'
import { front as frontDaisy } from '@freesewing/daisy'
import { frontArmholePitchDart } from '@freesewing/daisy'

export const front = {
  name: 'aimee.front',
  from: frontBase,
  after: backDaisy,
  hide: {
    from: true,
    after: true,
    inherited: true,
  },
  measurements: ['shoulderToWrist', 'wrist'],
  optionalMeasurements: ['shoulderToElbow'],
  options: {
    //Imported
    ...frontDaisy.options,
    //Constant
    bustDartPlacement: 'armholePitch', //Locked for Aimee
    bustDartLength: 1, //Locked for Aimee
    frontArmholeDepth: 0.552, //Locked for Aimee
    frontArmholePitchDepth: 0.5, //Locked for Aimee
    frontArmholePitchWidth: 0.911, //Locked for Aimee
    // bustDartCurve: 1,
    bustDartFraction: 0.5, //Altered for Aimee
    //Fit
    // elbowEase: { pct: 10, min: 0, max: 20, menu: 'fit' },
    daisyGuides: { bool: false, menu: 'fit' },
    wristEase: { pct: 28.9, min: 0, max: 35, menu: 'fit' },
    //Sleeves
    fitSleeveWidth: { bool: true, menu: 'sleeves' },
    sleeveLength: { pct: 100, min: 0, max: 100, menu: 'sleeves' },
    sleeveLengthBonus: { pct: 0, min: -10, max: 20, menu: 'sleeves' },
    armholeDrop: { pct: 29, min: 0, max: 35, menu: 'sleeves' },
    underArmSleeveLength: { pct: 6.6, min: 6, max: 8, menu: 'sleeves' },
    //Construction
    cfSaWidth: { pct: 0, min: 0, max: 3, menu: 'construction' }, //Altered for Aimee
    closureSaWidth: { pct: 1.5, min: 1, max: 3, menu: 'construction' }, //Altered for Aimee
    sleeveHemWidth: { pct: 2, min: 0, max: 3, menu: 'construction' },
    closurePosition: { dflt: 'back', list: ['front', 'back'], menu: 'construction' }, //Altered for Aimee
    //Advanced
    shoulderRise: { pct: 1.6, min: 0, max: 2, menu: 'advanced' },
    underArmCurve: { pct: 100, min: 50, max: 150, menu: 'advanced' },
    fullSleeves: { bool: true, menu: 'advanced' }, //So you can control separate sleeves later without affecting the bodice
  },
  draft: (sh) => {
    const {
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
    } = sh
    //draft
    frontArmholePitchDart(sh)
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

    if (!options.fitSleeveWidth) {
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

    //sleeve length
    if (measurements.shoulderToElbow) {
      points.elbowTop = points.shoulderRise.shiftTowards(
        points.bodiceSleeveTopMax,
        measurements.shoulderToElbow * (1 + options.sleeveLengthBonus)
      )
    } else {
      points.elbowTop = points.shoulderRise.shiftFractionTowards(points.bodiceSleeveTopMax, 0.5)
    }

    points.elbowBottom = points.bodiceSleeveBottomMin.shiftFractionTowards(
      points.bodiceSleeveBottomMax,
      points.bodiceSleeveTopMin.dist(points.elbowTop) /
        points.bodiceSleeveTopMin.dist(points.bodiceSleeveTopMax)
    )

    if (options.fullSleeves) {
      if (options.sleeveLength < 0.5) {
        points.bodiceSleeveTop = points.bodiceSleeveTopMin.shiftFractionTowards(
          points.elbowTop,
          2 * options.sleeveLength
        )
        points.bodiceSleeveBottom = points.bodiceSleeveBottomMin.shiftFractionTowards(
          points.elbowBottom,
          2 * options.sleeveLength
        )
      } else {
        points.bodiceSleeveTop = points.elbowTop.shiftFractionTowards(
          points.bodiceSleeveTopMax,
          2 * options.sleeveLength - 1
        )
        points.bodiceSleeveBottom = points.elbowBottom.shiftFractionTowards(
          points.bodiceSleeveBottomMax,
          2 * options.sleeveLength - 1
        )
      }
    } else {
      points.bodiceSleeveTop = points.bodiceSleeveTopMin
      points.bodiceSleeveBottom = points.bodiceSleeveBottomMin
    }

    //guides
    //DO NOT REMOVE!!! Useful for when making changes
    if (options.daisyGuides) {
      paths.daisyGuide = new Path()
        .move(points.cfWaist)
        .line(points.waistDartLeft)
        .line(points.waistDartTip)
        .line(points.waistDartRight)
        .line(points.sideWaist)
        .line(points.armhole)
        .curve(points.armholeCp2, points.armholePitchCp1, points.bustDartBottom)
        .line(points.bustDartTip)
        .line(points.bustDartTop)
        .curve_(points.armholePitchCp2, points.shoulder)
        .line(points.hps)
        .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
        .line(points.cfWaist)
        .attr('class', 'various lashed')

      paths.armLine = new Path()
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
        .attr('class', 'various lashed')

      paths.anchorLines = new Path()
        .move(points.bodiceSleeveBottomMin)
        .line(points.bodiceSleeveTopMin)
        .move(points.elbowBottom)
        .line(points.elbowTop)
        .move(points.bodiceSleeveBottomMax)
        .line(points.bodiceSleeveTopMax)
        .attr('class', 'various lashed')
    }
    //paths
    paths.waist = new Path()
      .move(points.cfWaist)
      .line(points.waistDartLeft)
      .line(points.waistDartTip)
      .line(points.waistDartRight)
      .line(points.sideWaist)
      .hide()

    paths.sideSeam = new Path()
      .move(points.sideWaist)
      .line(points.underArmCurveStart)
      .curve(
        points.underArmCurveStartCp2,
        points.bodiceSleeveBottomMinCp1,
        points.bodiceSleeveBottomMin
      )
      .line(points.bodiceSleeveBottom)
      .hide()

    paths.sleeveHem = new Path().move(points.bodiceSleeveBottom).line(points.bodiceSleeveTop).hide()

    paths.shoulder = new Path().move(points.bodiceSleeveTop).line(points.hps).hide()

    paths.cfNeck = new Path()
      .move(points.hps)
      .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
      .hide()

    paths.cf = new Path().move(points.cfNeck).line(points.cfWaist).hide()

    paths.seam = paths.waist
      .clone()
      .join(paths.sideSeam)
      .join(paths.sleeveHem)
      .join(paths.shoulder)
      .join(paths.cfNeck)
      .join(paths.cf)
      .close()

    //stores
    store.set('armholeDrop', armholeDrop)
    store.set('shoulderRise', shoulderRise)
    store.set('underArmSleeveLength', underArmSleeveLength)
    store.set('sleeveLengthMin', points.hps.dist(points.bodiceSleeveTopMin))
    store.set('sleeveLengthElbow', points.hps.dist(points.elbowTop))
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

    if (complete) {
      //grainline
      if (options.closurePosition != 'front' && options.cfSaWidth == 0) {
        points.cutOnFoldFrom = points.cfNeck
        points.cutOnFoldTo = points.cfWaist
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
      } else {
        points.grainlineTo = points.cfWaist.shiftFractionTowards(points.waistDartLeft, 0.15)
        points.grainlineFrom = new Point(points.grainlineTo.x, points.cfNeck.y)
        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
      }
      //notches
      macro('sprinkle', {
        snippet: 'notch',
        on: ['cfChest', 'bust', 'underArmCurveStart'],
      })
      if (options.sleeveLength > 0 && options.fullSleeves) {
        snippets.bodiceSleeveBottomMin = new Snippet('notch', points.bodiceSleeveBottomMin)
      }
      //title
      points.title = new Point(points.armhole.x * 0.4, points.title.y)
      macro('title', {
        at: points.title,
        nr: '1',
        title: 'Front',
        scale: 2 / 3,
      })
      //scalebox
      points.scalebox = new Point(points.title.x * 1.05, (points.bust.y * 3) / 4)
      macro('scalebox', {
        at: points.scalebox,
      })
      //dart edge
      paths.dartEdge = new Path()
        .move(points.waistDartLeft)
        .line(points.waistDartEdge)
        .line(points.waistDartRight)
        .attr('class', 'fabric help')

      if (sa) {
        const sideSeamSa = sa * options.sideSeamSaWidth * 100
        const sleeveHemSa = sa * options.sleeveHemWidth * 100
        const shoulderSa = sa * options.shoulderSaWidth * 100
        const neckSa = sa * options.neckSaWidth * 100

        let cfSa
        if (options.closurePosition == 'front') {
          cfSa = sa * options.closureSaWidth * 100
        } else {
          cfSa = sa * options.cfSaWidth * 100
        }

        points.saBodiceSleeveBottom = utils.beamsIntersect(
          points.bodiceSleeveBottomMinCp1
            .shiftTowards(points.bodiceSleeveBottom, sideSeamSa)
            .rotate(-90, points.bodiceSleeveBottomMinCp1),
          points.bodiceSleeveBottom
            .shiftTowards(points.bodiceSleeveBottomMinCp1, sideSeamSa)
            .rotate(90, points.bodiceSleeveBottom),
          points.bodiceSleeveBottom
            .shiftTowards(points.bodiceSleeveTop, sleeveHemSa)
            .rotate(-90, points.bodiceSleeveBottom),
          points.bodiceSleeveTop
            .shiftTowards(points.bodiceSleeveBottom, sleeveHemSa)
            .rotate(90, points.bodiceSleeveTop)
        )
        points.saBodiceSleeveTop = utils.beamsIntersect(
          points.bodiceSleeveTop
            .shiftTowards(points.hps, shoulderSa)
            .rotate(-90, points.bodiceSleeveTop),
          points.hps.shiftTowards(points.bodiceSleeveTop, shoulderSa).rotate(90, points.hps),
          points.saBodiceSleeveBottom,
          points.saBodiceSleeveBottom.shift(
            points.bodiceSleeveBottom.angle(points.bodiceSleeveTop),
            1
          )
        )
        points.saHps = utils.beamsIntersect(
          paths.cfNeck.offset(neckSa).start(),
          paths.cfNeck
            .offset(neckSa)
            .start()
            .shift(points.hps.angle(points.shoulderRise) + 90, 1),
          points.shoulderRise.shiftTowards(points.hps, shoulderSa).rotate(-90, points.shoulderRise),
          points.hps.shiftTowards(points.shoulderRise, shoulderSa).rotate(90, points.hps)
        )

        paths.sa = new Path()
          .move(points.saCfWaist)
          .line(points.saWaistDartLeft)
          .line(points.saWaistDartEdge)
          .line(points.saWaistDartRight)
          .line(points.saSideWaist)
          .line(paths.sideSeam.offset(sideSeamSa).start())
          .join(paths.sideSeam.offset(sideSeamSa))
          .line(points.saBodiceSleeveBottom)
          .line(points.saBodiceSleeveTop)
          .line(points.saHps)
          .line(paths.cfNeck.offset(neckSa).start())
          .join(paths.cfNeck.offset(neckSa))
          .line(points.saCfNeck)
          .line(points.saCfWaist)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
