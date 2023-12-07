import { front as frontAimee } from '@freesewing/aimee'

export const front = {
  name: 'shannon.front',
  from: frontAimee.from,
  after: frontAimee.after,
  hide: {
    from: true,
    after: true,
    inherited: true,
  },
  measurements: [
    ...frontAimee.measurements,
    'waistToHips',
    'waistToSeat',
    'waistToUpperLeg',
    'waistToKnee',
    'waistToFloor',
  ],
  optionalMeasurements: frontAimee.optionalMeasurements,
  options: {
    //Imported
    ...frontAimee.options,
    //Constants
    waistDartLength: 1, //Locked for Shannon
    fullSleeves: false, //Locked for Shannon
    closurePosition: 'side', //Locked for Shannon
    closureSaWidth: 0.01, //Locked for Shannon
    cpFraction: 0.55191502449,
    //Style
    skirtFullness: { pct: 50, min: 25, max: 100, menu: 'style' },
    skirtLength: { pct: 150, min: 0, max: 200, menu: 'style' },
    skirtLengthBonus: { pct: 0, min: -50, max: 50, menu: 'style' },
    //Plackets
    frontPlacketWidth: { pct: 76.2, min: 50, max: 90, menu: 'plackets' },
    frontPlacketLength: { pct: 100, min: 75, max: 100, menu: 'plackets' },
    frontPlacketCurve: { pct: 100, min: 0, max: 100, menu: 'plackets' },
    frontPlacketStyle: { dflt: 'straight', list: ['straight', 'curved'], menu: 'plackets' },
    neckOpeningLength: { pct: 85, min: 75, max: 100, menu: 'plackets' },
    neckOpeningWidth: { pct: 2.4, min: 1, max: 3, menu: 'plackets' },
    //Darts
    bustDartLength: { pct: 70, min: 60, max: 100, menu: 'darts' }, //Altered for Shannon
    //Construction
    cfSaWidth: { pct: 1, min: 1, max: 3, menu: 'construction' }, //Altered for Shannon
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
    frontAimee.draft(sh)
    //removing paths and snippets not required from Bella
    const keepThese = ['daisyGuide', 'armLine', 'anchorLines']
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    for (let i in snippets) delete snippets[i]
    //removing macros not required from Bella
    macro('title', false)
    macro('scalebox', false)
    //measures
    const frontPlacketWidth = points.hps.x * options.frontPlacketWidth
    const neckOpeningWidth = measurements.neck * options.neckOpeningWidth
    const skirtFullnessRatio =
      points.cfWaist.dist(points.waistDartLeft) /
      (points.cfWaist.dist(points.waistDartLeft) + points.waistDartRight.dist(points.sideWaist))

    let skirtLength
    if (options.skirtLength < 0.5) {
      skirtLength =
        measurements.waistToHips * (1 - options.skirtLength * 2) +
        measurements.waistToSeat * 2 * options.skirtLength
    }
    if (options.skirtLength >= 0.5 && options.skirtLength < 1) {
      skirtLength =
        measurements.waistToSeat * (-2 * options.skirtLength + 2) +
        measurements.waistToUpperLeg * (2 * options.skirtLength - 1)
    }
    if (options.skirtLength >= 1 && options.skirtLength < 1.5) {
      skirtLength =
        measurements.waistToUpperLeg * (-2 * options.skirtLength + 3) +
        measurements.waistToKnee * (2 * options.skirtLength - 2)
    }
    if (options.skirtLength >= 1.5) {
      skirtLength =
        measurements.waistToKnee * (-2 * options.skirtLength + 4) +
        measurements.waistToFloor * (2 * options.skirtLength - 3)
    }
    skirtLength = skirtLength * (1 + options.skirtLengthBonus)
    //let's begin
    //placket
    points.frontPlacketBottom = points.cfNeck.shiftFractionTowards(
      points.cfChest,
      options.frontPlacketLength
    )
    points.frontPlacketBottomRight = points.frontPlacketBottom.translate(
      frontPlacketWidth,
      -frontPlacketWidth
    )
    points.frontPlacketNeck = utils.lineIntersectsCurve(
      points.frontPlacketBottomRight,
      new Point(points.frontPlacketBottomRight.x, points.hps.y),
      points.hps,
      points.hpsCp2,
      points.cfNeckCp1,
      points.cfNeck
    )
    points.frontPlacketCurveStart = points.frontPlacketBottom.shift(
      0,
      frontPlacketWidth * (1 - options.frontPlacketCurve)
    )
    points.frontPlacketCurveEnd = points.frontPlacketBottomRight.shift(
      -90,
      frontPlacketWidth * (1 - options.frontPlacketCurve)
    )
    if (options.frontPlacketStyle == 'curved') {
      points.frontPlacketCurveStartCp2 = points.frontPlacketCurveStart.shift(
        0,
        frontPlacketWidth * options.frontPlacketCurve * options.cpFraction
      )
      points.frontPlacketCurveEndCp1 = points.frontPlacketCurveEnd.shift(
        -90,
        frontPlacketWidth * options.frontPlacketCurve * options.cpFraction
      )
    } else {
      points.frontPlacketCurveStartCp2 = points.frontPlacketCurveStart.shiftFractionTowards(
        points.frontPlacketCurveEnd,
        options.cpFraction
      )
      points.frontPlacketCurveEndCp1 = points.frontPlacketCurveEnd.shiftFractionTowards(
        points.frontPlacketCurveStart,
        options.cpFraction
      )
    }
    //neckOpening
    points.cfNeckOpening = points.cfNeck.shiftFractionTowards(
      new Point(points.cfNeck.x, points.frontPlacketBottom.y - frontPlacketWidth),
      options.neckOpeningLength
    )
    points.neckOpeningBottom = points.cfNeckOpening.translate(neckOpeningWidth, -neckOpeningWidth)
    points.neckOpening = utils.lineIntersectsCurve(
      points.neckOpeningBottom,
      new Point(points.neckOpeningBottom.x, points.hps.y),
      points.hps,
      points.hpsCp2,
      points.cfNeckCp1,
      points.cfNeck
    )
    points.neckOpeningBottomCp2 = points.neckOpeningBottom.shift(
      -90,
      neckOpeningWidth * options.cpFraction
    )
    points.cfNeckOpeningCp1 = points.cfNeckOpening.shift(0, neckOpeningWidth * options.cpFraction)
    //skirt
    const skirtAngle = 90 * options.skirtFullness
    points.sideHem = points.sideWaist.shift(
      -90 + skirtAngle * (1 - skirtFullnessRatio),
      skirtLength
    )
    points.skirtOrigin = utils.beamsIntersect(
      points.sideHem,
      points.sideWaist,
      points.cfWaist,
      points.cfWaist.shift(90 - skirtAngle * skirtFullnessRatio, 1)
    )
    const skirtRadius = points.skirtOrigin.dist(points.sideHem)
    const skirtCpDistance = (4 / 3) * skirtRadius * Math.tan(utils.deg2rad(skirtAngle / 4))
    points.cfHem = points.skirtOrigin.shiftTowards(points.cfWaist, skirtRadius)
    points.cfHemCp2 = points.cfHem
      .shiftTowards(points.skirtOrigin, skirtCpDistance)
      .rotate(-90, points.cfHem)
    points.sideHemCp1 = points.sideHem
      .shiftTowards(points.skirtOrigin, skirtCpDistance)
      .rotate(90, points.sideHem)
    //dolman sleeves
    paths.underArmCurve = new Path()
      .move(points.underArmCurveStart)
      .curve(
        points.underArmCurveStartCp2,
        points.bodiceSleeveBottomMinCp1,
        points.bodiceSleeveBottomMin
      )

    points.dolmanSleeveFront = paths.underArmCurve.shiftFractionAlong(0.5)
    points.dolmanSleeveTip = points.shoulderRise.shiftFractionTowards(
      points.bodiceSleeveTopMin,
      0.5
    )
    points.dolmanSleeveCpTarget = utils.beamsIntersect(
      points.dolmanSleeveTip,
      points.hps.rotate(90, points.dolmanSleeveTip),
      points.dolmanSleeveFront,
      paths.underArmCurve.shiftFractionAlong(0.49).rotate(-90, points.dolmanSleeveFront)
    )
    points.dolmanSleeveTipCp2 = points.dolmanSleeveTip.shiftFractionTowards(
      points.dolmanSleeveCpTarget,
      0.5
    )
    points.dolmanSleeveFrontCp1 = points.dolmanSleeveFront.shiftFractionTowards(
      points.dolmanSleeveCpTarget,
      0.5
    )
    points.dolmanMidAnchor = utils.beamsIntersect(
      points.bodiceSleeveBottomMin,
      points.bodiceSleeveBottomMin.shift(
        points.dolmanSleeveCpTarget.angle(points.dolmanSleeveTip),
        1
      ),
      points.hps,
      points.shoulderRise
    )
    points.dolmanSleeveFrontAnchor = utils.beamsIntersect(
      points.dolmanSleeveFront,
      points.dolmanSleeveFront.shift(points.dolmanSleeveCpTarget.angle(points.dolmanSleeveTip), 1),
      points.hps,
      points.shoulderRise
    )
    //stores
    store.set('skirtLength', skirtLength)
    store.set('skirtCentreAngle', points.cfWaist.angle(points.cfHem))
    store.set('skirtSideAngle', points.sideWaist.angle(points.sideHem))
    //guides
    paths.placketGuide = new Path()
      .move(points.frontPlacketBottom)
      .line(points.frontPlacketCurveStart)
      .curve(
        points.frontPlacketCurveStartCp2,
        points.frontPlacketCurveEndCp1,
        points.frontPlacketCurveEnd
      )
      .line(points.frontPlacketNeck)

    paths.stitchingGuide = new Path()
      .move(points.neckOpening)
      .line(points.neckOpeningBottom)
      .curve(points.neckOpeningBottomCp2, points.cfNeckOpeningCp1, points.cfNeckOpening)

    paths.skirt = new Path()
      .move(points.frontPlacketBottom)
      .line(points.cfChest)
      .curve(points.cfWaist, points.cfWaist, points.cfHem)
      .curve(points.cfHemCp2, points.sideHemCp1, points.sideHem)
      .curve(points.sideWaist, points.sideWaist, points.underArmCurveStart)

    paths.dolman = new Path()
      .move(points.dolmanSleeveTip)
      .curve(points.dolmanSleeveTipCp2, points.dolmanSleeveFrontCp1, points.dolmanSleeveFront)
      .line(points.dolmanSleeveFrontAnchor)
      .move(points.bodiceSleeveBottomMin)
      .line(points.dolmanMidAnchor)

    return part
  },
}
