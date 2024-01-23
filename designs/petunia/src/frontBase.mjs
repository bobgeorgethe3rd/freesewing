import { frontBase as frontBaseDaisy } from '@freesewing/daisy'
import { front as frontDaisy } from '@freesewing/daisy'
import { front2WaistDart } from '@freesewing/daisy'

export const frontBase = {
  name: 'petunia.frontBase',
  from: frontBaseDaisy,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Imported
    ...frontDaisy.options,
    //Constant
    bustDartPlacement: '2waist', //Locked for Petunia
    bustDartLength: 1, //Locked for Petunia
    waistDartLength: 1, //Locked for Petunia
    bustDartFraction: 0.5, //Locked for Petunia
    closurePosition: 'front', //Locked for Petunia
    //Fit
    daisyGuides: { bool: false, menu: 'fit' },
    //Style
    shoulderWidth: { pct: 50, min: 40, max: 60, menu: 'style' },
    frontNeckDepth: { pct: 100, min: 0, max: 100, menu: 'style' },
    frontAngle: { deg: 20, min: 15, max: 30, menu: 'style' },
    skirtLength: { pct: 200, min: 0, max: 200, menu: 'style' },
    skirtLengthBonus: { pct: -2, min: -50, max: 50, menu: 'style' },
    skirtFullness: { pct: 25, min: 25, max: 100, menu: 'style' },
    cfPanelFullness: { pct: (2 / 45) * 100, min: 1.1, max: 25, menu: 'style' },
  },
  measurements: ['waistToHips', 'waistToSeat', 'waistToUpperLeg', 'waistToKnee', 'waistToFloor'],
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
    front2WaistDart(sh)
    //removing paths and snippets not required from Bella
    const keepThese = 'seam'
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
    macro('scalebox', false)
    //measurements
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
    points.shoulderTop = points.shoulder.shiftFractionTowards(points.hps, options.shoulderWidth)
    points.cfNeckMin = new Point(points.cfNeck.x, points.armholePitch.y)
    if (points.cfNeckMin.y < points.cfNeck) {
      points.cfNeckMin = points.cfNeck.shiftFractionTowards(points.cArmhole, 0.25)
    }
    points.cfNeck = points.cfNeckMin.shiftFractionTowards(points.cArmhole, options.frontNeckDepth)

    points.cfNeckCp2 = points.bust.rotate(-options.frontAngle, points.cArmhole)
    points.sideWaistCp1 = utils.beamsIntersect(
      points.cfNeck,
      points.cfNeckCp2,
      points.sideWaist,
      points.bust.rotate(options.frontAngle, points.sideWaist)
    )
    points.shoulderTopCp2 = utils.beamsIntersect(
      points.cfNeck,
      points.cfNeckCp2.rotate(90, points.cfNeck),
      points.shoulderTop,
      points.hps.rotate(90, points.shoulderTop)
    )

    points.cfWaistLeft = utils.lineIntersectsCurve(
      points.waistDartLeft,
      points.bust,
      points.cfNeck,
      points.cfNeckCp2,
      points.sideWaistCp1,
      points.sideWaist
    )
    points.sideWaistRight = utils.lineIntersectsCurve(
      points.waistDartRight,
      points.bust,
      points.cfNeck,
      points.cfNeckCp2,
      points.sideWaistCp1,
      points.sideWaist
    )

    //centre front
    points.cfHemRightTarget = utils.beamIntersectsY(
      points.bust,
      points.bust.shift(270 + 90 * options.skirtFullness * options.cfPanelFullness, 1),
      points.cfWaist.y
    )
    points.cfHemRight = points.bust.shiftOutwards(points.cfHemRightTarget, skirtLength)
    points.cfSkirtOrigin = utils.beamIntersectsX(
      points.cfHemRight,
      points.cfWaistLeft,
      points.cfWaist.x
    )

    const cfSkirtRadius = points.cfSkirtOrigin.dist(points.cfHemRight)
    const cfSkirtAngle = points.cfSkirtOrigin.angle(points.cfHemRight) - 270
    const cfSkirtCpDistance = (4 / 3) * cfSkirtRadius * Math.tan(utils.deg2rad(cfSkirtAngle / 4))

    points.cfHem = points.cfSkirtOrigin.shift(-90, cfSkirtRadius)
    points.cfHemCp2 = points.cfHem
      .shiftTowards(points.cfSkirtOrigin, cfSkirtCpDistance)
      .rotate(-90, points.cfHem)
    points.cfHemRightCp1 = points.cfHemRight
      .shiftTowards(points.cfSkirtOrigin, cfSkirtCpDistance)
      .rotate(90, points.cfHemRight)

    const sideSkirtAngle = 90 * options.skirtFullness - cfSkirtAngle
    points.sideWaistR = points.sideWaist.rotate(-store.get('bustDartAngle'), points.bust)

    points.sideSkirtOrigin = utils.beamsIntersect(
      points.sideWaistRight,
      points.sideWaistRight.shift(90 - sideSkirtAngle / 2, 1),
      points.sideWaistR,
      points.sideWaistR.shift(90 + sideSkirtAngle / 2, 1)
    )

    points.sideHemLeft = points.sideWaistRight.shift(
      270 - sideSkirtAngle / 2,
      points.cfWaistLeft.dist(points.cfHemRight)
    )
    points.sideHemRight = points.sideSkirtOrigin.shift(
      270 + sideSkirtAngle / 2,
      points.sideSkirtOrigin.dist(points.sideHemLeft)
    )

    const sideSkirtRadius = points.sideSkirtOrigin.dist(points.sideHemLeft)
    const sideSkirtAngleT =
      points.sideSkirtOrigin.angle(points.sideHemRight) -
      points.sideSkirtOrigin.angle(points.sideHemLeft)
    const sideSkirtCpDistance =
      (4 / 3) * sideSkirtRadius * Math.tan(utils.deg2rad(sideSkirtAngleT / 4))

    points.sideHemLeftCp2 = points.sideHemLeft
      .shiftTowards(points.sideSkirtOrigin, sideSkirtCpDistance)
      .rotate(-90, points.sideHemLeft)
    points.sideHemRightCp1 = points.sideHemRight
      .shiftTowards(points.sideSkirtOrigin, sideSkirtCpDistance)
      .rotate(90, points.sideHemRight)

    //stores
    store.set('sideSkirtLength', points.sideWaistR.dist(points.sideHemRight))

    //guides
    paths.frontTop = new Path()
      .move(points.shoulderTop)
      .curve_(points.shoulderTopCp2, points.cfNeck)
      .curve(points.cfNeckCp2, points.sideWaistCp1, points.sideWaist)

    paths.centreFront = new Path()
      .move(points.cfNeck)
      .line(points.cfHem)
      .curve(points.cfHemCp2, points.cfHemRightCp1, points.cfHemRight)
      .line(points.cfWaistLeft)

    paths.sideFront = new Path()
      .move(points.sideWaistRight)
      .line(points.sideHemLeft)
      .curve(points.sideHemLeftCp2, points.sideHemRightCp1, points.sideHemRight)
      .line(points.sideWaistR)
      .line(points.sideWaistRight)

    return part
  },
}
