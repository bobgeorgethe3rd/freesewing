import { pctBasedOn } from '@freesewing/core'
import { front as frontDaisy } from '@freesewing/daisy'
import { backBase } from './backBase.mjs'

export const frontBase = {
  name: 'taliya.frontBase',
  from: frontDaisy,
  after: backBase,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Constant
    bustDartPlacement: 'bustSide', //Locked for Taliya
    waistDartLength: 1, //Locked for Taliya
    bustDartFraction: 0.5, //Locked for Taliya
    //Fit
    bodyWidth: { pct: 25, min: 12.5, max: 50, menu: 'fit' },
    bodyEase: { pct: 5, min: 0, max: 20, menu: 'fit' },
    //Style
    neckbandEnd: { pct: 21.1, min: 0, max: 25, menu: 'style' },
    frontNeckDepth: { pct: 22.5, min: 20, max: 75, menu: 'style' },
    bodyLength: { pct: 125, min: 0, max: 250, menu: 'style' },
    bodyLengthBonus: { pct: 0, min: -50, max: 150, menu: 'style' },
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
    absoluteOptions,
    log,
  }) => {
    //removing paths and snippets not required from Bella
    const keepThese = ['armhole', 'seam']
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
    //measures
    const neckbandWidth = absoluteOptions.neckbandWidth
    //let's begin
    //skirt
    const waistFront = points.sideWaist.x

    let midBodyWidth
    let maxBodyWidth
    if ((measurements.seat / 4 || measurements.hips / 4) > waistFront) {
      if (measurements.seat > measurements.hips) {
        midBodyWidth = measurements.hips * (1 + options.bodyEase) * 0.25
        maxBodyWidth = measurements.seat * (1 + options.bodyEase) * 0.25
        log.warning('measurements.seat is being used to draft bodyWidth, options.bodyWidth locked.')
      } else {
        midBodyWidth = measurements.hips * (1 + options.bodyEase) * 0.25
        maxBodyWidth = measurements.hips * (1 + options.bodyEase) * 0.375
        log.warning('measurements.hips is being used to draft bodyWidth, options.bodyWidth locked.')
      }
    } else {
      midBodyWidth = waistFront * (1 + options.bodyWidth * 0.5)
      maxBodyWidth = waistFront * (1 + options.bodyWidth)
      log.warning('waistFront is being used to draft bodyWidth, options.bodyWidth unlocked.')
    }
    let bodyLength
    let bodyWidth
    if (options.bodyLength < 0.5) {
      bodyLength = measurements.waistToHips * 2 * options.bodyLength
      bodyWidth = waistFront * (1 - options.bodyLength * 2) + midBodyWidth * options.bodyLength * 2
    }
    if (options.bodyLength >= 0.5 && options.bodyLength < 1) {
      bodyLength =
        measurements.waistToHips +
        (measurements.waistToSeat - measurements.waistToHips) * (2 * options.bodyLength - 1)
      bodyWidth =
        midBodyWidth * (1 - (2 * options.bodyLength - 1)) +
        maxBodyWidth * (2 * options.bodyLength - 1)
    }
    if (options.bodyLength >= 1 && options.bodyLength < 1.5) {
      bodyLength =
        measurements.waistToSeat +
        (measurements.waistToUpperLeg - measurements.waistToSeat) * (2 * options.bodyLength - 2)
      bodyWidth = maxBodyWidth * (1 + (options.bodyLength - 1) * 0.5)
    }
    if (options.bodyLength >= 1.5 && options.bodyLength < 2) {
      bodyLength =
        measurements.waistToUpperLeg +
        (measurements.waistToKnee - measurements.waistToUpperLeg) * (2 * options.bodyLength - 3)
      bodyWidth = maxBodyWidth * (1 + (options.bodyLength - 1) * 0.5)
    }
    if (options.bodyLength >= 2) {
      bodyLength =
        measurements.waistToKnee +
        (measurements.waistToFloor - measurements.waistToKnee) * (2 * options.bodyLength - 4)
      bodyWidth = maxBodyWidth * (1 + (options.bodyLength - 1) * 0.5)
    }
    bodyLength = bodyLength * (1 + options.bodyLengthBonus)

    const widthDiff = bodyWidth - waistFront
    const sideAngle =
      utils.rad2deg(Math.atan(widthDiff / (bodyLength / (1 + options.bodyLengthBonus)))) ||
      utils.rad2deg(Math.atan((midBodyWidth - waistFront) / measurements.waistToHips))

    points.sideHem = points.sideWaist.shift(270 + sideAngle, bodyLength)

    points.sideHemCp2 = points.sideHem.shiftFractionTowards(points.sideWaist, 2 / 3)
    points.armholeCp1 = points.armhole.shiftFractionTowards(points.sideWaist, 2 / 3)
    points.cfHemCp2 = utils.beamsIntersect(
      points.sideHem,
      points.sideHem.shift(180 + sideAngle, 1),
      new Point(points.sideHem.x / 2, points.sideHem.y),
      new Point(points.sideHem.x / 2, points.sideHem.y * 1.1)
    )
    points.cfHem = utils.beamIntersectsX(
      points.cfHemCp2,
      points.cfHemCp2.shift(180, 1),
      points.cfWaist.x
    )
    if (points.cfHem.y < points.cfWaist.y) {
      points.cfHem = points.cfWaist
      points.cfHemCp2 = new Point(points.cfHemCp2.x, points.cfWaist.y)
      if (options.neckbandEnd < 0.1) {
        options.neckbandEnd = 0.1
      }
    }
    //
    points.cfNeckbandEnd = points.cfWaist.shiftFractionTowards(points.cfChest, options.neckbandEnd)
    points.neckbandEnd = points.cfNeckbandEnd.shift(0, neckbandWidth / 2)
    points.neckbandArmhole = new Point(points.neckbandEnd.x, points.cArmhole.y)

    points.shoulderTop = points.shoulder.shiftTowards(points.hps, store.get('shoulderWidth'))
    points.shoulderTopCp2 = points.shoulderTop.shift(
      points.shoulder.angle(points.armholePitchCp2),
      points.shoulder.dist(points.armholePitchCp2)
    )
    points.neckbandArmholeCp1 = points.neckbandArmhole.shift(
      90,
      points.cArmhole.dist(points.cfNeck) * (1 - options.frontNeckDepth)
    )
    //sleeves
    paths.cfNeck = new Path()
      .move(points.shoulderTop)
      .curve(points.shoulderTopCp2, points.neckbandArmholeCp1, points.neckbandArmhole)
      .hide()

    points.raglanNeckSplit = paths.cfNeck.shiftAlong(store.get('raglanNeckWidth'))
    points.armholeRaglanCp2 = points.armhole.shiftFractionTowards(
      new Point(points.armholePitch.x, points.armhole.y),
      2 / 3
    )
    points.raglanCurveEnd = utils.beamIntersectsX(
      points.raglanNeckSplit,
      points.armholeRaglanCp2,
      points.armholePitch.x
    )

    points.gatherNeckSplit = paths.cfNeck.split(points.raglanNeckSplit)[1].shiftFractionAlong(3 / 4)
    //guides
    paths.cfNeckCheck = paths.cfNeck
      .clone()
      .offset(neckbandWidth)
      .line(points.cfNeck.shiftFractionTowards(points.cfChest, 0.376))

    paths.raglan = new Path()
      .move(points.armhole)
      .curve_(points.armholeRaglanCp2, points.raglanCurveEnd)
      .line(points.raglanNeckSplit)

    //stores
    store.set('neckbandWidth', neckbandWidth)
    store.set('shoulderWidth', points.shoulder.dist(points.shoulderTop))
    store.set('bodyLength', bodyLength)
    store.set('sideAngle', sideAngle)

    return part
  },
}
