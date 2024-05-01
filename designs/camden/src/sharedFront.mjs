import { frontBase } from '@freesewing/daisy'
import { pctBasedOn } from '@freesewing/core'
import { pluginLogoRG } from '@freesewing/plugin-logorg'

export const sharedFront = {
  name: 'camden.sharedFront',
  from: frontBase,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Constants
    closurePosition: 'none', //Locked for Camden
    //Fit
    bodyWidth: { pct: 25, min: 12.5, max: 50, menu: 'fit' },
    bodyEase: { pct: 5, min: 0, max: 20, menu: 'fit' },
    //Style
    armholeDrop: { pct: 25, min: 0, max: 75, menu: 'style' },
    shoulderPitch: { pct: 50, min: 30, max: 60, menu: 'style' },
    frontShoulderDepth: { pct: 80, min: 0, max: 100, menu: 'style' },
    backShoulderDepth: { pct: 80, min: 0, max: 100, menu: 'style' },
    frontNeckDepth: { pct: 60, min: 0, max: 100, menu: 'style' },
    frontNeckCurve: { pct: 50, min: 0, max: 100, menu: 'style' },
    frontNeckCurveDepth: { pct: (2 / 3) * 100, min: 0, max: 100, menu: 'style' },
    bodyLength: { pct: 75, min: 0, max: 250, menu: 'style' },
    bodyLengthBonus: { pct: 0, min: -50, max: 150, menu: 'style' },
    sideCurve: { pct: 100, min: 25, max: 100, menu: 'style' },
    strapWidth: {
      pct: 4.7,
      min: 1,
      max: 6,
      snap: 5,
      ...pctBasedOn('waist'),
      menu: 'style',
    },
    //Construction
    bodiceFacings: { bool: true, menu: 'construction' },
  },
  measurements: ['waistToHips', 'waistToSeat', 'waistToUpperLeg', 'waistToKnee', 'waistToFloor'],
  optionalMeasurements: ['hips', 'seat'],
  plugins: [pluginLogoRG],
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
    //measures
    const strapWidth = absoluteOptions.strapWidth
    //let's begin
    paths.daisyGuide = paths.guide
    //strap placement
    points.shoulderPitch = points.hps.shiftFractionTowards(points.shoulder, options.shoulderPitch)
    points.shoulderPitchMax = new Point(points.shoulderPitch.x, points.armholePitch.y)
    points.strapMid = points.shoulderPitch.shiftFractionTowards(
      points.shoulderPitchMax,
      options.frontShoulderDepth
    )
    if (options.frontShoulderDepth == 0 && options.backShoulderDepth == 0) {
      points.strapLeft = points.strapMid.shiftTowards(points.hps, strapWidth / 2)
    } else {
      points.strapLeft = points.strapMid.shift(180, strapWidth / 2)
    }
    points.strapRight = points.strapLeft.rotate(180, points.strapMid)

    if (points.strapRight.x > points.armholePitch.x) {
      if (options.frontShoulderDepth == 0 && options.backShoulderDepth == 0) {
        points.strapRight = points.strapMid.shiftTowards(points.shoulder, strapWidth / 2)
      } else {
        points.strapRight = new Point(points.armholePitch.x, points.strapMid.y)
      }
      points.strapLeft = points.strapRight.rotate(180, points.strapMid)
    }
    //neck
    if (points.strapLeft.y > points.cfNeck.y) {
      points.cfTopMin = new Point(points.cfNeck.x, points.strapLeft.y)
    } else {
      points.cfTopMin = points.cfNeck
    }
    // points.cfTopMin = new Point(points.cfNeck.x, points.armholePitch.y)
    points.cfTop = points.cfTopMin.shiftFractionTowards(points.cfChest, options.frontNeckDepth)
    points.cfTopCp1Target = utils.beamsIntersect(
      points.strapLeft,
      points.strapLeft.shift(-90, 1),
      points.cfTop,
      points.cfTop.shift(points.cfTop.angle(points.strapLeft) * options.frontNeckCurve, 1)
    )
    points.cfTopCp1 = points.cfTop.shiftFractionTowards(
      points.cfTopCp1Target,
      options.frontNeckCurveDepth
    )
    //armhole
    points.armholeDrop = points.armhole.shiftFractionTowards(
      points.bustDartTop,
      options.armholeDrop
    )
    points.strapRightCp1 = utils.beamsIntersect(
      points.strapRight,
      points.strapRight.shift(points.armholePitch.angle(points.armholePitchCp1), 1),
      points.armholePitchCp1,
      points.armholePitch.rotate(90, points.armholePitchCp1)
    )
    points.armholeDropCp2Target = utils.beamsIntersect(
      points.armholeDrop,
      points.armholeDrop.shift(points.armhole.angle(points.armholeCp2), 1),
      points.strapRight,
      points.strapRight.shift(-90, 1)
    )
    points.armholeDropCp2 = points.armholeDrop.shiftFractionTowards(
      points.armholeDropCp2Target,
      options.frontArmholeDepth
    )
    //hem
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

    const wdthDiff = bodyWidth - waistFront
    const sideAngle =
      utils.rad2deg(Math.atan(wdthDiff / (bodyLength / (1 + options.bodyLengthBonus)))) ||
      utils.rad2deg(Math.atan((midBodyWidth - waistFront) / measurements.waistToHips))

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

    //guides
    paths.guide = new Path()
      .move(points.cfHem)
      .curve_(points.cfHemCp2, points.sideHem)
      .curve(points.sideHemCp2, points.bustDartBottomCp1, points.bustDartBottom)
      .line(points.bust)
      .line(points.bustDartTop)
      .line(points.armholeDrop)
      .curve(points.armholeDropCp2, points.strapRightCp1, points.strapRight)
      .line(points.strapLeft)
      ._curve(points.cfTopCp1, points.cfTop)

    //stores
    store.set(
      'sideLength',
      points.armholeDrop.dist(points.bustDartTop) + points.bustDartBottom.dist(points.sideWaist)
    )
    store.set('strapWidth', strapWidth)
    store.set('strapFrontLength', points.strapMid.dist(points.shoulderPitch))
    store.set('armholeDrop', points.armhole.dist(points.armholeDrop))
    store.set('sideAngle', sideAngle)
    store.set('bodyLength', bodyLength)
    store.set(
      'sideSeamLength',
      new Path()
        .move(points.sideHem)
        .curve(points.sideHemCp2, points.bustDartBottomCp1, points.bustDartBottom)
        .length() + points.bustDartTop.dist(points.armholeDrop)
    )
    store.set('bodiceFacingWidth', points.armholeDrop.dist(points.bustDartTop))

    return part
  },
}
