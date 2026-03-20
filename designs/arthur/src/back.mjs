import { pctBasedOn } from '@freesewing/core'
import { back as byronBack } from '@freesewing/byron'

export const back = {
  name: 'arthur.back',
  from: byronBack,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Constants
    backArmholeDepth: 0.552, //Locked for Arthur
    armholePitchDepth: 0.5, //Locked for Arthur
    backArmholePitchWidth: 0.97, //Locked for Arthur
    //Fit
    byronGuides: { bool: false, menu: 'fit' },
    wristEase: { pct: 30.8, min: 0, max: 50, menu: 'fit' },
    //Sleeves
    armholeDrop: { pct: (1 / 6) * 100, min: 0, max: 30, menu: 'sleeves' },
    sleeveLength: { pct: 100, min: 0, max: 100, menu: 'sleeves' },
    sleeveLengthBonus: { pct: 0, min: -20, max: 50, menu: 'sleeves' },
    fitSleeveWidth: { bool: true, menu: 'sleeves' },
    underArmSleeveLength: { pct: 6.7, min: 6, max: 8, menu: 'sleeves' },
    //Construction
    sleeveHemWidth: { pct: 2, min: 0, max: 3, menu: 'construction' },
    //Advanced
    underArmCurve: { pct: 100, min: 50, max: 150, menu: 'advanced' },
    shoulderRise: { pct: 2.2, min: 0, max: 2.5, menu: 'advanced' },
    fullSleeves: { bool: true, menu: 'advanced' }, //So you can control separate sleeves later without affecting the block
  },
  measurements: ['shoulderToWrist', 'wrist'],
  optionalMeasurements: ['shoulderToElbow'],
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
    //remove paths & snippets
    const keepThese = ['sideSeam', 'seam']
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    if (options.byronGuides) {
      paths.byronGuide = paths.seam.attr('class', 'various lashed')
    }
    delete paths.seam
    for (let i in snippets) delete snippets[i]
    //remove macros
    macro('title', false)
    macro('scalebox', false)
    //measures
    const shoulderRise = measurements.hpsToWaistBack * options.shoulderRise
    const sleeveLength = measurements.shoulderToWrist * (1 + options.sleeveLengthBonus)
    const elbowLength = measurements.shoulderToElbow
      ? measurements.shoulderToElbow * (1 + options.sleeveLengthBonus)
      : sleeveLength * 0.5
    const wrist = measurements.wrist * (1 + options.wristEase)
    const underArmSleeveLength = measurements.shoulderToWrist * options.underArmSleeveLength
    const underArmSideSeamLength = underArmSleeveLength * options.underArmCurve
    //let's begin
    points.shoulderRise = points.shoulder.shift(
      points.shoulder.angle(points.hps) - 90,
      shoulderRise
    )
    points.cbNeckCp1 = utils.beamIntersectsY(
      points.hps,
      points.shoulderRise.rotate(
        (180 - (points.hps.angle(points.shoulderRise) - 270)) * -1,
        points.hps
      ),
      points.cbNeck.y
    )
    //arm
    points.armholeDrop = paths.sideSeam.reverse().shiftFractionAlong(options.armholeDrop)
    points.sleeveTopMax = points.hps.shiftOutwards(points.shoulderRise, sleeveLength)
    points.elbowTop = points.hps.shiftOutwards(points.shoulderRise, elbowLength)

    points.sleeveBottomMax = options.fitSleeveWidth
      ? points.sleeveTopMax.shift(points.sleeveTopMax.angle(points.hps) + 90, wrist * 0.5)
      : utils.beamsIntersect(
          points.armholeDrop,
          points.armholeDrop.shift(points.hps.angle(points.shoulderRise), 1),
          points.sleeveTopMax,
          points.sleeveTopMax.shift(points.shoulderRise.angle(points.hps) + 90, 1)
        )

    points.elbowBottom = utils.beamsIntersect(
      points.armholeDrop,
      points.sleeveBottomMax,
      points.elbowTop,
      points.elbowTop.shift(points.shoulderRise.angle(points.hps) + 90, 1)
    )

    points.sleeveBottomMin = points.armholeDrop.shiftTowards(
      points.sleeveBottomMax,
      underArmSleeveLength
    )
    points.sleeveTopMin = utils.beamsIntersect(
      points.hps,
      points.shoulderRise,
      points.sleeveBottomMin,
      points.sleeveBottomMin.shift(points.sleeveBottomMax.angle(points.sleeveTopMax), 1)
    )

    points.underArmCurveStart =
      options.armholeDrop > 0
        ? paths.sideSeam.split(points.armholeDrop)[0].reverse().shiftAlong(underArmSideSeamLength)
        : paths.sideSeam.reverse().shiftAlong(underArmSideSeamLength)

    points.underArmCurveAnchor = utils.beamsIntersect(
      points.underArmCurveStart,
      paths.sideSeam.split(points.underArmCurveStart)[0].shiftFractionAlong(0.995),
      points.sleeveBottomMax,
      points.sleeveBottomMin
    )

    points.underArmCurveOrigin = utils.beamsIntersect(
      points.underArmCurveAnchor,
      points.underArmCurveStart.shiftFractionTowards(points.sleeveBottomMin, 0.5),
      points.sleeveBottomMin,
      points.underArmCurveAnchor.rotate(90, points.sleeveBottomMin)
    )

    const underArmCurveAngle =
      points.underArmCurveOrigin.angle(points.underArmCurveStart) -
      points.underArmCurveOrigin.angle(points.sleeveBottomMin)
    const underArmCurveCpDist =
      (4 / 3) *
      points.underArmCurveOrigin.dist(points.underArmCurveStart) *
      Math.tan(utils.deg2rad(underArmCurveAngle / 4))

    points.underArmCurveStartCp2 = points.underArmCurveStart.shiftTowards(
      points.underArmCurveAnchor,
      underArmCurveCpDist
    )
    points.sleeveBottomMinCp1 = points.sleeveBottomMin.shiftTowards(
      points.underArmCurveAnchor,
      underArmCurveCpDist
    )

    if (points.underArmCurveStartCp2.y < points.underArmCurveAnchor.y)
      points.underArmCurveStartCp2 = points.underArmCurveAnchor

    points.sleeveBottom = options.fullSleeves
      ? options.sleeveLength < 0.5
        ? points.sleeveBottomMin.shiftFractionTowards(points.elbowBottom, options.sleeveLength * 2)
        : points.elbowBottom.shiftFractionTowards(
            points.sleeveBottomMax,
            2 * options.sleeveLength - 1
          )
      : points.sleeveBottomMin

    points.sleeveTop = options.fullSleeves
      ? options.sleeveLength < 0.5
        ? points.sleeveTopMin.shiftFractionTowards(points.elbowTop, options.sleeveLength * 2)
        : points.elbowTop.shiftFractionTowards(points.sleeveTopMax, 2 * options.sleeveLength - 1)
      : points.sleeveTopMin

    //paths
    if (options.byronGuides) {
      paths.armLine = paths.sideSeam
        .split(points.underArmCurveStart)[0]
        .curve(points.underArmCurveStartCp2, points.sleeveBottomMinCp1, points.sleeveBottomMin)
        .line(points.sleeveBottomMax)
        .line(points.sleeveTopMax)
        .line(points.hps)
        .attr('class', 'various lashed')

      paths.anchorLines = new Path()
        .move(points.sleeveBottomMax)
        .line(points.sleeveTopMax)
        .move(points.elbowBottom)
        .line(points.elbowTop)
        .move(points.sleeveBottomMin)
        .line(points.sleeveTopMin)
        .attr('class', 'various lashed')
    }

    paths.sideSeam = paths.sideSeam
      .split(points.underArmCurveStart)[0]
      .curve(points.underArmCurveStartCp2, points.sleeveBottomMinCp1, points.sleeveBottomMin)
      .line(points.sleeveBottom)
      .hide()

    paths.cbNeck = new Path().move(points.hps)._curve(points.cbNeckCp1, points.cbNeck).hide()

    paths.seam = new Path()
      .move(points.cWaist)
      .line(points.sideWaist)
      .join(paths.sideSeam)
      .line(points.sleeveTop)
      .line(points.hps)
      .join(paths.cbNeck)
      .line(points.cWaist)
      .close()

    //stores
    store.set('shoulderRise', shoulderRise)
    store.set('sleeveLength', sleeveLength)
    store.set('elbowLength', elbowLength)
    store.set('wrist', wrist)
    store.set('underArmSleeveLength', underArmSleeveLength)
    store.set('underArmSideSeamLength', underArmSideSeamLength)
    store.set('underArmCurveCpDist', underArmCurveCpDist)

    if (complete) {
      //grainline
      let titleCutNum
      if (options.closurePosition != 'back' && options.cbSaWidth == 0) {
        points.cutOnFoldFrom = points.cbNeck
        points.cutOnFoldTo = points.cWaist
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
        titleCutNum = 1
      } else {
        points.grainlineFrom = points.cbNeck.shiftFractionTowards(points.cbNeckCp1, 0.25)
        points.grainlineTo = new Point(points.grainlineFrom.x, points.cWaist.y)
        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
        titleCutNum = 2
      }
      //notches
      snippets.underArmCurveStart = new Snippet('notch', points.underArmCurveStart)
      if (points.sleeveBottomMin.dist(points.sleeveBottom) > 0) {
        snippets.sleeveBottomMin = new Snippet('notch', points.sleeveBottomMin)
      }
      //title
      macro('title', {
        at: points.title,
        nr: '1',
        title: 'Back',
        scale: 0.75,
        cutNr: titleCutNum,
      })
      //scalebox
      macro('scalebox', {
        at: points.scalebox,
      })

      if (sa) {
        const sideSeamSa = sa * options.sideSeamSaWidth * 100
        const sleeveHemSa = sa * options.sleeveHemWidth * 100
        const neckSa = sa * options.neckSaWidth * 100
        const shoulderSa = sa * options.shoulderSaWidth * 100

        points.saSleeveBottom = utils.beamsIntersect(
          points.sleeveBottomMinCp1
            .shiftTowards(points.sleeveBottomMin, sideSeamSa)
            .rotate(-90, points.sleeveBottomMinCp1),
          points.sleeveBottomMin
            .shiftTowards(points.sleeveBottomMinCp1, sideSeamSa)
            .rotate(90, points.sleeveBottomMin),
          points.sleeveBottom
            .shiftTowards(points.sleeveTop, sleeveHemSa)
            .rotate(-90, points.sleeveBottom),
          points.sleeveTop
            .shiftTowards(points.sleeveBottom, sleeveHemSa)
            .rotate(90, points.sleeveTop)
        )

        points.saSleeveTop = utils.beamsIntersect(
          points.sleeveTop.shiftTowards(points.hps, shoulderSa).rotate(-90, points.sleeveTop),
          points.hps.shiftTowards(points.sleeveTop, shoulderSa).rotate(90, points.hps),
          points.saSleeveBottom,
          points.saSleeveBottom.shift(points.sleeveBottom.angle(points.sleeveTop), 1)
        )

        points.saHps = utils.beamsIntersect(
          paths.cbNeck.offset(neckSa).start(),
          paths.cbNeck
            .offset(neckSa)
            .start()
            .shift(points.hps.angle(points.shoulderRise) + 90, 1),
          points.saSleeveTop,
          points.saSleeveTop.shift(points.shoulderRise.angle(points.hps), 1)
        )

        paths.sa = new Path()
          .move(points.saCWaist)
          .line(points.saSideWaist)
          .join(paths.sideSeam.split(points.sleeveBottomMin)[0].offset(sideSeamSa))
          .line(points.saSleeveBottom)
          .line(points.saSleeveTop)
          .line(points.saHps)
          .join(paths.cbNeck.offset(neckSa))
          .line(points.saCbNeck)
          .line(points.saCWaist)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
