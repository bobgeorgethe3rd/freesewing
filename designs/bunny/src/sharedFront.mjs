import { frontBase } from '@freesewing/daisy'
import { pctBasedOn } from '@freesewing/core'

export const sharedFront = {
  name: 'bunny.sharedFront',
  from: frontBase,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Constants
    closurePosition: 'back', //Locked for Bunny
    //Fit
    width: { pct: 25, min: 12.5, max: 50, menu: 'fit' },
    bodyEase: { pct: 10, min: 0, max: 20, menu: 'fit' },
    //Style
    // armholeDrop: { pct: 25, min: 0, max: 75, menu: 'style' },
    bodyLength: { pct: 100, min: 0, max: 250, menu: 'style' },
    bodyLengthBonus: { pct: 0, min: -20, max: 10, menu: 'style' },
    sideCurve: { pct: 100, min: 25, max: 100, menu: 'style' },
    frontNeckDepth: { pct: 14.1, min: -6, max: 45, menu: 'style' },
    shoulderWidth: { pct: 50, min: (1 / 3) * 100, max: (2 / 3) * 100, menu: 'style' }, //37.6
    frontNeckCurve: { pct: 100, min: 0, max: 100, menu: 'style' },
    frontNeckCurveDepth: { pct: 100, min: 0, max: 100, menu: 'style' },
    //Construction
    bodiceFacings: { bool: false, menu: 'construction' },
  },
  measurements: ['waistToHips', 'waistToSeat', 'waistToUpperLeg', 'waistToKnee', 'waistToFloor'],
  optionalMeasurements: ['hips', 'seat'],
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
    //let's begin
    paths.daisyGuide = paths.guide.attr('class', 'various lashed')
    //measurements
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

    //let's begin
    points.sideHem = points.sideWaist.shift(270 + sideAngle, bodyLength)
    points.cfHemCp2 = utils.beamsIntersect(
      points.sideHem,
      points.sideHem.shift(180 + sideAngle, 1),
      new Point(points.sideHem.x / 2, points.sideHem.y),
      new Point(points.sideHem.x / 2, points.sideHem.y * 1.1)
    )
    points.cfHem = new Point(points.cfWaist.x, points.cfHemCp2.y)
    if (points.cfHem.y < points.cfWaist.y) {
      points.cfHem = points.cfWaist
      points.cfHemCp2 = new Point(points.cfHemCp2.x, points.cfWaist.y)
    }
    //sideSeam
    points.sideHemCp2 = points.sideHem.shiftFractionTowards(points.sideWaist, options.sideCurve)
    points.bustDartBottomCp1 = points.bustDartBottom.shiftFractionTowards(
      points.sideWaist,
      options.sideCurve
    )

    //neck
    points.cfTop = points.cfNeck.shiftFractionTowards(points.cfChest, options.frontNeckDepth)
    points.shoulderTop = points.shoulder.shiftFractionTowards(points.hps, options.shoulderWidth)

    points.cfTopCp1 = points.cfTop.shiftFractionTowards(
      utils.beamsIntersect(
        points.cfTop,
        points.cfTop.shift(
          points.cfTop.angle(points.shoulderTop) * (1 - options.frontNeckCurve),
          1
        ),
        points.shoulderTop,
        points.hps.rotate(90, points.shoulderTop)
      ),
      options.frontNeckCurveDepth
    )

    //paths
    paths.hemBase = new Path().move(points.cfHem).curve_(points.cfHemCp2, points.sideHem).hide()

    paths.armhole = new Path()
      .move(points.armhole)
      .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
      .curve_(points.armholePitchCp2, points.shoulder)
      .hide()

    paths.cfNeck = new Path().move(points.shoulderTop)._curve(points.cfTopCp1, points.cfTop).hide()

    //guides
    paths.guide = new Path()
      .move(points.cfHem)
      .curve_(points.cfHemCp2, points.sideHem)
      .curve(points.sideHemCp2, points.bustDartBottomCp1, points.bustDartBottom)

    //stores
    store.set('sideBustLength', points.armhole.dist(points.bustDartTop))
    store.set(
      'sideLength',
      points.armhole.dist(points.bustDartTop) + points.bustDartBottom.dist(points.sideWaist)
    )
    store.set(
      'sideSeamLength',
      new Path()
        .move(points.sideHem)
        .curve(points.sideHemCp2, points.bustDartBottomCp1, points.bustDartBottom)
        .length() + store.get('sideBustLength')
    )
    store.set('sideAngle', sideAngle)
    store.set('bodyLength', bodyLength)

    if (complete) {
      if (sa) {
        if (options.bodiceFacings) {
          if (options.armholeSaWidth < 0.01) {
            options.armholeSaWidth = 0.01
          }
          if (options.necklineSaWidth < 0.01) {
            options.necklineSaWidth = 0.01
          }
        }
      }
    }
    return part
  },
}
