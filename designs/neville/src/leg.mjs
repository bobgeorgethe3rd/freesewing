import { pctBasedOn } from '@freesewing/core'
import { pluginBundle } from '@freesewing/plugin-bundle'
import { draftCross } from './draftCross.mjs'

export const leg = {
  name: 'neville.leg',
  from: draftCross,
  hide: {
    from: true,
  },
  options: {
    //Constants
    crossSeamSaWidth: 0.01,
    sideSeamSaWidth: 0.01,
    fitWaistBack: false,
    fitWaistFront: false,
    legBandsBool: true,
    //Fit
    waistEase: { pct: 3.2, min: 0, max: 20, menu: 'fit' },
    hipsEase: { pct: 3, min: 0, max: 20, menu: 'fit' },
    kneeEase: { pct: 6.6, min: 0, max: 20, menu: 'fit' },
    calfEase: { pct: 6.8, min: 0, max: 20, menu: 'fit' },
    heelEase: { pct: 7.4, min: 0, max: 20, menu: 'fit' },
    ankleEase: { pct: 10.8, min: 0, max: 20, menu: 'fit' },
    fitGuides: { bool: true, menu: 'fit' },
    //Style
    fitWaist: { bool: true, menu: 'style' },
    fitKnee: { bool: false, menu: 'style' },
    fitCalf: { bool: false, menu: 'style' },
    fitFloor: { bool: true, menu: 'style' },
    useHeel: { bool: true, menu: 'style' },
    legLengthBonus: { pct: 2, min: -20, max: 20, menu: 'style' },
    //Darts
    backDartPlacement: { pct: 62.5, min: 40, max: 70, menu: 'darts' },
    backDartWidth: { pct: 3.2, min: 0, max: 6, menu: 'darts' },
    backDartDepth: { pct: 95, min: 45, max: 100, menu: 'darts' },
    //Construction
    hemWidth: { pct: 2, min: 0, max: 3, menu: 'construction' },
    //Advanced
    backDartMultiplier: { count: 1, min: 0, max: 5, menu: 'advanced' },
    calculateWaistbandDiff: { bool: true, menu: 'advanced' },
    calculateLegBandDiff: { bool: true, menu: 'advanced' },
    legBandWidth: {
      pct: 0,
      min: 0,
      max: 6,
      snap: 5,
      ...pctBasedOn('waistToFloor'),
      menu: 'advanced',
    },
  },
  measurements: [
    'ankle',
    'knee',
    'calf',
    'heel',
    'hips',
    'hipsBack',
    'waist',
    'waistBack',
    'waistToKnee',
    'waistToCalf',
  ],
  plugins: [pluginBundle],
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
    //set options
    if (options.fitWaist) {
      options.fitWaistBack = true
      options.fitWaistFront = true
    }
    //measures
    const crossSeamBack = store.get('crossSeamBack')
    const toHips = store.get('toHips')
    const toUpperLeg = store.get('toUpperLeg')
    const seatBack = store.get('seatBack')
    const seatFront = store.get('seatFront')
    const waistbandWidth = store.get('waistbandWidth')
    let hipsBack
    let hipsFront
    if (options.useBackMeasures) {
      void store.setIfUnset('waistBack', measurements.waistBack * (1 + options.waistEase))
      void store.setIfUnset(
        'waistFront',
        (measurements.waist - measurements.waistBack) * (1 + options.waistEase)
      )
      hipsBack = measurements.hipsBack * (1 + options.hipsEase)
      hipsFront = (measurements.hips - measurements.hipsBack) * (1 + options.hipsEase)
    } else {
      void store.setIfUnset('waistBack', measurements.waist * (1 + options.waistEase) * 0.5)
      void store.setIfUnset('waistFront', measurements.waist * (1 + options.waistEase) * 0.5)
      hipsBack = measurements.hips * (1 + options.hipsEase) * 0.5
      hipsFront = measurements.hips * (1 + options.hipsEase) * 0.5
    }
    const waistBack = store.get('waistBack')
    const waistFront = store.get('waistFront')

    const knee = measurements.knee * (1 + options.kneeEase)
    const calf = measurements.calf * (1 + options.calfEase)
    let legBandWidth = absoluteOptions.legBandWidth
    if (!options.legBandsBool) {
      legBandWidth = 0
    }
    let toFloor = measurements.waistToFloor * (1 + options.legLengthBonus) - legBandWidth
    if (toFloor < measurements.waistToCalf) {
      toFloor = measurements.waistToFloor * 1.02
      log.warning(
        'legLength to short to draft correct please check options.legLengthBonus, options.legBandWidth, measurements.waistToCalf && measurements.waistFloor for incompatiblilities'
      )
    }
    const legBackRatio = crossSeamBack / measurements.crossSeam
    const legFrontRatio = measurements.crossSeamFront / measurements.crossSeam

    let floor = measurements.heel * (1 + options.heelEase)
    if (!options.useHeel) {
      floor = measurements.ankle * (1 + options.ankleEase)
    }
    let legBandDiff
    if (options.calculateLegBandDiff) {
      // if (knee > calf) {
      // legBandDiff =
      // ((legBandWidth * (knee - floor)) / (toFloor - measurements.waistToKnee))
      // }
      // else {
      legBandDiff = (legBandWidth * (calf - floor)) / (toFloor - measurements.waistToCalf)
      // }
    } else {
      legBandDiff = 0
    }
    floor = floor + legBandDiff

    let waistbandDiff
    if (options.calculateWaistbandDiff || options.waistbandStyle == 'curved') {
      waistbandDiff =
        (waistbandWidth *
          (measurements.hips * (1 + options.hipsEase) -
            measurements.waist * (1 + options.waistEase))) /
        measurements.waistToHips /
        2
    } else {
      waistbandDiff = 0
    }

    const backDartWidth =
      measurements.waist * options.backDartWidth +
      measurements.waist * options.backDartWidth * options.backDartMultiplier * options.waistHeight

    const backDartDepth =
      (measurements.waistToSeat - measurements.waistToHips) * options.backDartDepth +
      measurements.waistToHips * options.waistHeight -
      waistbandWidth

    if (options.fitWaistBack || waistBack > seatBack) {
      void store.setIfUnset(
        'styleWaistBack',
        waistBack * options.waistHeight + hipsBack * (1 - options.waistHeight) + waistbandDiff
      )
    } else {
      void store.setIfUnset('styleWaistBack', seatBack)
    }
    const styleWaistBack = store.get('styleWaistBack') + backDartWidth * 2

    if (options.fitWaistFront || waistFront > seatFront) {
      void store.setIfUnset(
        'styleWaistFront',
        waistFront * options.waistHeight + hipsFront * (1 - options.waistHeight) + waistbandDiff
      )
    } else {
      void store.setIfUnset('styleWaistFront', seatFront)
    }
    const styleWaistFront = store.get('styleWaistFront')
    //waistBack
    points.upperLegBack = points.upperLeg.shiftOutwards(points.upperLegCrossAnchor, seatBack / 2)
    points.waistBackAnchor = points.upperLegBack
      .shiftTowards(points.upperLeg, toUpperLeg - toHips - waistbandWidth)
      .rotate(-90, points.upperLegBack)
    points.waistBack = points.waistCross.shift(
      points.waistCross.angle(points.waistBackAnchor),
      styleWaistBack / 2
    )
    points.seatBack = points.seatCross.shift(
      points.waistCross.angle(points.waistBackAnchor),
      seatBack / 2
    )
    //dart
    points.waistDartAnchor = points.waistCross.shiftFractionTowards(
      points.waistBack,
      options.backDartPlacement
    )

    points.seatDartAnchor = points.seatBack.shiftFractionTowards(
      points.seatCross,
      options.backDartPlacement
    )

    points.seatDartTarget = utils.beamsIntersect(
      points.waistDartAnchor,
      points.waistCross.rotate(90, points.waistDartAnchor),
      points.seatBack,
      points.seatBack.shift(points.waistBack.angle(points.waistCross), 1)
    )

    if (points.seatDartTarget.y < points.seatDartAnchor.y) {
      points.seatDart = points.seatDartAnchor.shiftFractionTowards(
        points.seatDartTarget,
        1 - options.backDartPlacement
      )
    } else {
      points.seatDart = points.seatDartAnchor.shiftFractionTowards(
        points.seatDartTarget,
        options.backDartPlacement
      )
    }
    points.dartMid = utils.beamsIntersect(
      points.seatDart,
      points.seatDartAnchor.rotate(-90, points.seatDart),
      points.waistCross,
      points.waistBack
    )

    points.dartIn = points.dartMid.shiftTowards(points.waistCross, backDartWidth / 2)
    points.dartOut = points.dartIn.rotate(180, points.dartMid)
    points.dartTip = points.dartMid.shiftTowards(points.seatDart, backDartDepth)
    //waistFront
    points.upperLegFront = points.upperLeg.shiftOutwards(points.upperLegCrotchAnchor, seatFront / 2)
    points.waistFrontAnchor = points.upperLegFront
      .shiftTowards(points.upperLeg, toUpperLeg - toHips - waistbandWidth)
      .rotate(90, points.upperLegFront)
    points.waistFront = points.waistCrotch.shift(
      points.waistCrotch.angle(points.waistFrontAnchor),
      styleWaistFront / 2
    )
    points.seatFront = points.seatCrotch.shift(
      points.waistCrotch.angle(points.waistFrontAnchor),
      seatFront / 2
    )
    //leg
    // points.upperLegAnchor = new Point(
    // (points.waistBack.shiftTowards(points.waistCross, backDartWidth).x + points.waistFront.x) / 2,
    // points.upperLeg.y
    // )

    if (measurements.crossSeamFront > crossSeamBack) {
      points.upperLegBackAnchor = points.upperLegCrossAnchor.shiftFractionTowards(
        points.upperLegBack,
        0.5
      )
      points.upperLegFrontAnchor = points.upperLeg
        .shiftFractionTowards(points.upperLegCrotchAnchor, 0.5)
        .shiftFractionTowards(points.upperLegFront, 0.5)
    } else {
      points.upperLegBackAnchor = points.upperLeg
        .shiftFractionTowards(points.upperLegCrossAnchor, 0.5)
        .shiftFractionTowards(points.upperLegBack, 0.5)
      points.upperLegFrontAnchor = points.upperLegCrotchAnchor.shiftFractionTowards(
        points.upperLegFront,
        0.5
      )
    }

    points.kneeBackAnchor = points.upperLegBackAnchor
      .shiftTowards(points.upperLegBack, measurements.waistToKnee - toUpperLeg)
      .rotate(-90, points.upperLegBackAnchor)
    points.kneeFrontAnchor = points.upperLegFrontAnchor
      .shiftTowards(points.upperLegFront, measurements.waistToKnee - toUpperLeg)
      .rotate(90, points.upperLegFrontAnchor)

    points.kneeBack = points.kneeBackAnchor
      .shiftTowards(points.upperLegBackAnchor, knee * legBackRatio * 0.5)
      .rotate(-90, points.kneeBackAnchor)
    points.kneeFront = points.kneeFrontAnchor
      .shiftTowards(points.upperLegFrontAnchor, knee * legFrontRatio * 0.5)
      .rotate(90, points.kneeFrontAnchor)

    points.knee = points.kneeFront.shiftFractionTowards(points.kneeBack, 0.5)
    points.kneeBack = points.knee.shiftTowards(points.kneeBack, knee * 0.5)
    points.kneeFront = points.knee.shiftTowards(points.kneeFront, knee * 0.5)

    points.calf = points.knee
      .shiftTowards(points.kneeFront, measurements.waistToCalf - measurements.waistToKnee)
      .rotate(90, points.knee)
    points.calfBack = points.calf.shift(points.knee.angle(points.kneeBack), calf * 0.5)
    points.calfFront = points.calf.shift(points.knee.angle(points.kneeFront), calf * 0.5)

    points.floor = points.knee.shiftTowards(points.calf, toFloor - measurements.waistToKnee)
    if (options.fitFloor) {
      points.floorBack = points.floor.shift(points.knee.angle(points.kneeBack), floor * 0.5)
    } else {
      if (knee > calf) {
        points.floorBack = points.kneeBack.shift(
          points.knee.angle(points.floor),
          points.knee.dist(points.floor)
        )
      } else {
        points.floorBack = points.calfBack.shift(
          points.knee.angle(points.floor),
          points.calf.dist(points.floor)
        )
      }
    }

    points.floorFront = points.floorBack.rotate(180, points.floor)

    points.waistBackI = utils.beamsIntersect(
      points.waistCross,
      points.waistBack,
      points.seatBack,
      points.seatBack.shift(points.upperLegBack.angle(points.waistBackAnchor), 1)
    )
    points.waistFrontI = utils.beamsIntersect(
      points.waistCrotch,
      points.waistFront,
      points.seatFront,
      points.seatFront.shift(points.upperLegFront.angle(points.waistFrontAnchor), 1)
    )

    points.seatBackI = utils.beamsIntersect(
      points.waistBack,
      points.waistBack.shift(points.waistBackAnchor.angle(points.upperLegBack), 1),
      points.seatBack,
      points.seatBack.shift(points.upperLegBack.angle(points.waistBackAnchor) - 90, 1)
    )
    points.seatFrontI = utils.beamsIntersect(
      points.waistFront,
      points.waistFront.shift(points.waistFrontAnchor.angle(points.upperLegFront), 1),
      points.seatFront,
      points.seatFront.shift(points.upperLegFront.angle(points.waistFrontAnchor) + 90, 1)
    )

    points.seatBackCp2 = points.seatBack.shift(
      points.upperLegBack.angle(points.waistBackAnchor),
      points.seatBackI.dist(points.waistBack) / 2
    )
    points.seatFrontCp1 = points.seatFront.shift(
      points.upperLegFront.angle(points.waistFrontAnchor),
      points.seatFrontI.dist(points.waistFront) / 2
    )

    if (points.waistBack.x > points.waistBackI.x) {
      points.seatBackCp2 = points.seatBack.shift(
        points.waistCross.angle(points.waistBack) + 90,
        points.seatBack.dist(points.seatBackCp2)
      )
    }

    if (points.waistFront.x < points.waistFrontI.x) {
      points.seatFrontCp1 = points.seatFront.shift(
        points.waistCrotch.angle(points.waistFront) - 90,
        points.seatFront.dist(points.seatFrontCp1)
      )
    }

    points.seatBackKneeAnchor = utils.beamsIntersect(
      points.upperLegBackAnchor,
      points.kneeBackAnchor,
      points.seatBack,
      points.seatBack.shift(points.upperLegBack.angle(points.waistBackAnchor) + 90, 1)
    )
    points.seatFrontKneeAnchor = utils.beamsIntersect(
      points.upperLegFrontAnchor,
      points.kneeFrontAnchor,
      points.seatFront,
      points.seatFront.shift(points.upperLegFront.angle(points.waistFrontAnchor) - 90, 1)
    )

    if (options.fitKnee || options.fitCalf) {
      points.seatBackCp1 = points.seatBackCp2.shiftOutwards(
        points.seatBack,
        points.seatBackKneeAnchor.dist(points.kneeBackAnchor) / 3
      )
      points.seatFrontCp2 = points.seatFrontCp1.shiftOutwards(
        points.seatFront,
        points.seatFrontKneeAnchor.dist(points.kneeFrontAnchor) / 3
      )
      if (options.fitCalf) {
        points.floorBackCp2 = points.floorBack.shift(
          points.floor.angle(points.knee),
          points.floor.dist(points.calf) / 2
        )
        points.floorFrontCp1 = points.floorFront.shift(
          points.floor.angle(points.knee),
          points.floor.dist(points.calf) / 2
        )
      } else {
        points.floorBackCp2 = points.floorBack.shift(
          points.floor.angle(points.knee),
          points.floor.dist(points.knee) / 2
        )
        points.floorFrontCp1 = points.floorFront.shift(
          points.floor.angle(points.knee),
          points.floor.dist(points.knee) / 2
        )
      }
    } else {
      points.seatBackCp1 = points.seatBackCp2.shiftOutwards(
        points.seatBack,
        points.seatBackKneeAnchor.dist(points.upperLegBackAnchor) +
          (points.upperLegBackAnchor.dist(points.kneeBackAnchor) * 2) / 3
      )
      points.seatFrontCp2 = points.seatFrontCp1.shiftOutwards(
        points.seatFront,
        points.seatFrontKneeAnchor.dist(points.upperLegFrontAnchor) +
          (points.upperLegFrontAnchor.dist(points.kneeFrontAnchor) * 2) / 3
      )
      points.floorBackCp2 = points.floorBack.shift(
        points.floor.angle(points.knee),
        points.floor.dist(points.knee)
      )
      points.floorFrontCp1 = points.floorFront.shift(
        points.floor.angle(points.knee),
        points.floor.dist(points.knee)
      )
    }

    points.kneeBackCp2 = points.kneeBack.shift(
      points.floor.angle(points.knee),
      points.upperLegBackAnchor.dist(points.kneeBackAnchor) / 3
    )
    points.kneeFrontCp1 = points.kneeFront.shift(
      points.floor.angle(points.knee),
      points.upperLegFrontAnchor.dist(points.kneeFrontAnchor) / 3
    )

    points.calfBackCp1 = points.calfBack.shift(
      points.knee.angle(points.floor),
      points.floor.dist(points.calf) / 3
    )

    points.calfFrontCp2 = points.calfFront.shift(
      points.knee.angle(points.floor),
      points.floor.dist(points.calf) / 3
    )

    if (options.fitCalf) {
      points.kneeBackCp1 = points.kneeBackCp2.shiftOutwards(
        points.kneeBack,
        points.knee.dist(points.calf) / 3
      )
      points.kneeFrontCp2 = points.kneeFrontCp1.shiftOutwards(
        points.kneeFront,
        points.knee.dist(points.calf) / 3
      )
    } else {
      points.kneeBackCp1 = points.kneeBackCp2.shiftOutwards(
        points.kneeBack,
        points.knee.dist(points.floor) / 3
      )
      points.kneeFrontCp2 = points.kneeFrontCp1.shiftOutwards(
        points.kneeFront,
        points.knee.dist(points.floor) / 3
      )
    }
    if (options.fitKnee) {
      points.calfBackCp2 = points.calfBackCp1.shiftOutwards(
        points.calfBack,
        points.calf.dist(points.knee) / 3
      )
      points.calfFrontCp1 = points.calfFrontCp2.shiftOutwards(
        points.calfFront,
        points.calf.dist(points.knee) / 3
      )
    } else {
      points.calfBackCp2 = points.calfBackCp1.shiftOutwards(
        points.calfBack,
        (measurements.waistToCalf - toUpperLeg) / 3
      )
      points.calfFrontCp1 = points.calfFrontCp2.shiftOutwards(
        points.calfFront,
        (measurements.waistToCalf - toUpperLeg) / 3
      )
    }

    if (options.fitKnee) {
      points.seatBackAnchor = utils.lineIntersectsCurve(
        points.seatCross,
        points.seatCross.shiftFractionTowards(points.seatBack, 2),
        points.kneeBack,
        points.kneeBackCp2,
        points.seatBack,
        points.waistBack
      )
      points.seatFrontAnchor = utils.lineIntersectsCurve(
        points.seatCrotch,
        points.seatCrotch.shiftFractionTowards(points.seatFront, 2),
        points.waistFront,
        points.seatFront,
        points.kneeFrontCp1,
        points.kneeFront
      )
    } else {
      if (options.fitCalf) {
        points.seatBackAnchor = utils.lineIntersectsCurve(
          points.seatCross,
          points.seatCross.shiftFractionTowards(points.seatBack, 2),
          points.calfBack,
          points.calfBackCp2,
          points.seatBack,
          points.waistBack
        )
        points.seatFrontAnchor = utils.lineIntersectsCurve(
          points.seatCrotch,
          points.seatCrotch.shiftFractionTowards(points.seatFront, 2),
          points.waistFront,
          points.seatFront,
          points.calfFrontCp1,
          points.calfFront
        )
      } else {
        points.seatBackAnchor = utils.lineIntersectsCurve(
          points.seatCross,
          points.seatCross.shiftFractionTowards(points.seatBack, 2),
          points.floorBack,
          points.floorBackCp2,
          points.seatBack,
          points.waistBack
        )
        points.seatFrontAnchor = utils.lineIntersectsCurve(
          points.seatCrotch,
          points.seatCrotch.shiftFractionTowards(points.seatFront, 2),
          points.waistFront,
          points.seatFront,
          points.floorFrontCp1,
          points.floorFront
        )
      }
    }

    if (
      points.waistBack.x > points.waistBackI.x &&
      points.seatBackAnchor.x < points.seatBack.x &&
      !options.fitKnee &&
      !options.fitCalf
    ) {
      points.floorBackCp2 = points.floorBackCp2.shiftTowards(
        points.floorBack,
        points.seatBackKneeAnchor.dist(points.kneeBackAnchor) / 3
      )
    }

    if (
      points.waistFront.x < points.waistFrontI.x &&
      points.seatFrontAnchor.x > points.seatFront.x &&
      !options.fitKnee
    ) {
      points.floorFrontCp1 = points.floorFrontCp1.shiftTowards(
        points.floorFront,
        points.seatFrontKneeAnchor.dist(points.kneeFrontAnchor) / 3
      )
    }

    //paths
    const drawOutseamBack = () => {
      if (options.fitKnee) {
        if (options.fitCalf) {
          if (points.seatBackAnchor.x > points.seatBack.x)
            return new Path()
              .move(points.floorBack)
              .curve(points.floorBackCp2, points.calfBackCp1, points.calfBack)
              .curve(points.calfBackCp2, points.kneeBackCp1, points.kneeBack)
              .curve(points.kneeBackCp2, points.seatBack, points.waistBack)
          else
            return new Path()
              .move(points.floorBack)
              .curve(points.floorBackCp2, points.calfBackCp1, points.calfBack)
              .curve(points.calfBackCp2, points.kneeBackCp1, points.kneeBack)
              .curve(points.kneeBackCp2, points.seatBackCp1, points.seatBack)
              .curve_(points.seatBackCp2, points.waistBack)
        } else {
          if (points.seatBackAnchor.x > points.seatBack.x)
            return new Path()
              .move(points.floorBack)
              .curve(points.floorBackCp2, points.kneeBackCp1, points.kneeBack)
              .curve(points.kneeBackCp2, points.seatBack, points.waistBack)
          else
            return new Path()
              .move(points.floorBack)
              .curve(points.floorBackCp2, points.kneeBackCp1, points.kneeBack)
              .curve(points.kneeBackCp2, points.seatBackCp1, points.seatBack)
              .curve_(points.seatBackCp2, points.waistBack)
        }
      } else {
        if (options.fitCalf) {
          if (points.seatBackAnchor.x > points.seatBack.x)
            return new Path()
              .move(points.floorBack)
              .curve(points.floorBackCp2, points.calfBackCp1, points.calfBack)
              .curve(points.calfBackCp2, points.seatBack, points.waistBack)
          else
            return new Path()
              .move(points.floorBack)
              .curve(points.floorBackCp2, points.calfBackCp1, points.calfBack)
              .curve(points.calfBackCp2, points.seatBackCp1, points.seatBack)
              .curve_(points.seatBackCp2, points.waistBack)
        } else {
          if (points.seatBackAnchor.x > points.seatBack.x)
            return new Path()
              .move(points.floorBack)
              .curve(points.floorBackCp2, points.seatBack, points.waistBack)
          else
            return new Path()
              .move(points.floorBack)
              .curve(points.floorBackCp2, points.seatBackCp1, points.seatBack)
              .curve_(points.seatBackCp2, points.waistBack)
        }
      }
    }

    const drawWaistBack = () =>
      options.backDartWidth == 0
        ? new Path().move(points.waistBack).line(points.waistCross)
        : new Path()
            .move(points.waistBack)
            .line(points.dartOut)
            .line(points.dartTip)
            .line(points.dartIn)
            .line(points.waistCross)

    const drawOutseamFront = () => {
      if (options.fitKnee) {
        if (options.fitCalf) {
          if (points.seatFrontAnchor.x < points.seatFront.x)
            return new Path()
              .move(points.waistFront)
              .curve(points.seatFront, points.kneeFrontCp1, points.kneeFront)
              .curve(points.kneeFrontCp2, points.calfFrontCp1, points.calfFront)
              .curve(points.calfFrontCp2, points.floorFrontCp1, points.floorFront)
          else
            return new Path()
              .move(points.waistFront)
              ._curve(points.seatFrontCp1, points.seatFront)
              .curve(points.seatFrontCp2, points.kneeFrontCp1, points.kneeFront)
              .curve(points.kneeFrontCp2, points.calfFrontCp1, points.calfFront)
              .curve(points.calfFrontCp2, points.floorFrontCp1, points.floorFront)
        } else {
          if (points.seatFrontAnchor.x < points.seatFront.x)
            return new Path()
              .move(points.waistFront)
              .curve(points.seatFront, points.kneeFrontCp1, points.kneeFront)
              .curve(points.kneeFrontCp2, points.floorFrontCp1, points.floorFront)
          else
            return new Path()
              .move(points.waistFront)
              ._curve(points.seatFrontCp1, points.seatFront)
              .curve(points.seatFrontCp2, points.kneeFrontCp1, points.kneeFront)
              .curve(points.kneeFrontCp2, points.floorFrontCp1, points.floorFront)
        }
      } else {
        if (options.fitCalf) {
          if (points.seatFrontAnchor.x < points.seatFront.x)
            return new Path()
              .move(points.waistFront)
              .curve(points.seatFront, points.calfFrontCp1, points.calfFront)
              .curve(points.calfFrontCp2, points.floorFrontCp1, points.floorFront)
          else
            return new Path()
              .move(points.waistFront)
              ._curve(points.seatFrontCp1, points.seatFront)
              .curve(points.seatFrontCp2, points.calfFrontCp1, points.calfFront)
              .curve(points.calfFrontCp2, points.floorFrontCp1, points.floorFront)
        } else {
          if (points.seatFrontAnchor.x < points.seatFront.x)
            return new Path()
              .move(points.waistFront)
              .curve(points.seatFront, points.floorFrontCp1, points.floorFront)
          else
            return new Path()
              .move(points.waistFront)
              ._curve(points.seatFrontCp1, points.seatFront)
              .curve(points.seatFrontCp2, points.floorFrontCp1, points.floorFront)
        }
      }
    }
    paths.hemBase = new Path().move(points.floorFront).line(points.floorBack).hide()

    paths.seam = paths.hemBase
      .clone()
      .join(drawOutseamBack())
      .join(drawWaistBack())
      .join(paths.crossSeam)
      .line(points.waistFront)
      .join(drawOutseamFront())
      .close()

    if (complete) {
      //grainline
      points.grainlineTo = points.floor.shiftFractionTowards(points.floorFront, 2 / 3)
      points.grainlineFrom = points.grainlineTo.shift(
        points.floor.angle(points.knee),
        points.floor.y
      )
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      snippets.crossSeamCurveStart = new Snippet('bnotch', points.crossSeamCurveStart)
      macro('sprinkle', {
        snippet: 'notch',
        on: ['crotchSeamCurveEnd', 'upperLeg'],
      })
      //title
      points.title = points.knee.shiftFractionTowards(
        points.upperLegFrontAnchor.shiftFractionTowards(points.upperLegBackAnchor, 0.5),
        0.5
      )
      macro('title', {
        nr: 1,
        title: 'Leg',
        at: points.title,
        scale: 0.5,
      })
      //scalebox
      points.scalebox = points.knee.shiftFractionTowards(points.floor, 0.5)
      macro('scalebox', { at: points.scalebox })
      //fitGuides
      if (options.fitGuides) {
        if (measurements.waistToHips * options.waistHeight - waistbandWidth > 0) {
          points.hipsGuideCross = points.waistCross
            .shiftTowards(
              points.crossSeamCurveStart,
              measurements.waistToHips * options.waistHeight - waistbandWidth
            )
            .shift(points.waistCross.angle(points.waistBack), waistBack * 0.05)
          points.hipsGuideBack = points.hipsGuideCross.shift(
            points.waistCross.angle(points.waistBack),
            waistBack * 0.15
          )

          points.hipsGuideCrotch = points.waistCrotch
            .shiftTowards(
              points.crotchSeamCurveEnd,
              measurements.waistToHips * options.waistHeight - waistbandWidth
            )
            .shift(points.waistCrotch.angle(points.waistFront), waistFront * 0.05)
          points.hipsGuideFront = points.hipsGuideCrotch.shift(
            points.waistCrotch.angle(points.waistFront),
            waistFront * 0.15
          )

          paths.hipsGuideBack = new Path()
            .move(points.hipsGuideCross)
            .line(points.hipsGuideBack)
            .attr('class', 'various')
            .attr('data-text', 'Hips Guide')
            .attr('data-text-class', 'left')

          paths.hipsGuideFront = new Path()
            .move(points.hipsGuideFront)
            .line(points.hipsGuideCrotch)
            .attr('class', 'various')
            .attr('data-text', 'Hips Guide')
            .attr('data-text-class', 'left')

          macro('sprinkle', {
            snippet: 'notch',
            on: ['hipsGuideCross', 'hipsGuideBack', 'hipsGuideCrotch', 'hipsGuideFront'],
          })
        }
        points.seatGuideCross = points.seatCross.shift(
          points.waistCross.angle(points.waistBack),
          waistBack * 0.05
        )
        points.seatGuideBack = points.seatGuideCross.shift(
          points.waistCross.angle(points.waistBack),
          waistBack * 0.15
        )

        points.seatGuideCrotch = points.seatCrotch.shift(
          points.waistCrotch.angle(points.waistFront),
          waistFront * 0.05
        )
        points.seatGuideFront = points.seatGuideCrotch.shift(
          points.waistCrotch.angle(points.waistFront),
          waistFront * 0.15
        )

        paths.seatGuideBack = new Path()
          .move(points.seatGuideCross)
          .line(points.seatGuideBack)
          .attr('class', 'various')
          .attr('data-text', 'Seat Guide')
          .attr('data-text-class', 'left')

        paths.seatGuideFront = new Path()
          .move(points.seatGuideFront)
          .line(points.seatGuideCrotch)
          .attr('class', 'various')
          .attr('data-text', 'Seat Guide')
          .attr('data-text-class', 'left')

        if (options.fitKnee) {
          points.kneeGuideBack = points.kneeBack
        } else {
          points.kneeGuideBack = drawOutseamBack().intersects(
            new Path().move(points.knee).line(points.knee.shiftFractionTowards(points.kneeBack, 10))
          )[0]
        }
        points.kneeGuideCross = points.kneeGuideBack.shiftFractionTowards(points.kneeFront, 0.25)
        paths.kneeGuideBack = new Path()
          .move(points.kneeGuideCross)
          .line(points.kneeGuideBack)
          .attr('class', 'various')
          .attr('data-text', 'Knee Guide')
          .attr('data-text-class', 'right')

        macro('sprinkle', {
          snippet: 'notch',
          on: [
            'seatGuideCross',
            'seatGuideBack',
            'seatGuideCrotch',
            'seatGuideFront',
            'kneeGuideCross',
            'kneeGuideBack',
          ],
        })
      }
      if (sa) {
        const hemSa = sa * options.hemWidth * 100
        const sideSeamSa = sa * options.sideSeamSaWidth * 100
        const crossSeamSa = sa * options.crossSeamSaWidth * 100

        points.saFloorFront = points.floorFront
          .shift(points.floorBack.angle(points.floorFront), sideSeamSa)
          .shift(points.floorFrontCp1.angle(points.floorFront), hemSa)

        points.saFloorBack = points.floorBack
          .shift(points.floorFront.angle(points.floorBack), sideSeamSa)
          .shift(points.floorBackCp2.angle(points.floorBack), hemSa)

        points.saWaistBack = utils.beamsIntersect(
          drawOutseamBack().offset(sideSeamSa).shiftFractionAlong(0.995),
          drawOutseamBack().offset(sideSeamSa).end(),
          points.waistBack.shiftTowards(points.waistCross, sa).rotate(-90, points.waistBack),
          points.waistCross.shiftTowards(points.waistBack, sa).rotate(90, points.waistCross)
        )

        points.saWaistCross = utils.beamsIntersect(
          points.waistBack.shiftTowards(points.waistCross, sa).rotate(-90, points.waistBack),
          points.waistCross.shiftTowards(points.waistBack, sa).rotate(90, points.waistCross),
          points.waistCross
            .shiftTowards(points.crossSeamCurveStart, crossSeamSa)
            .rotate(-90, points.waistCross),
          points.crossSeamCurveStart
            .shiftTowards(points.waistCross, crossSeamSa)
            .rotate(90, points.crossSeamCurveStart)
        )

        points.saWaistCrotch = utils.beamsIntersect(
          points.crotchSeamCurveEnd
            .shiftTowards(points.waistCrotch, crossSeamSa)
            .rotate(-90, points.crotchSeamCurveEnd),
          points.waistCrotch
            .shiftTowards(points.crotchSeamCurveEnd, crossSeamSa)
            .rotate(90, points.waistCrotch),
          points.waistCrotch.shiftTowards(points.waistFront, sa).rotate(-90, points.waistCrotch),
          points.waistFront.shiftTowards(points.waistCrotch, sa).rotate(90, points.waistFront)
        )

        points.saWaistFront = utils.beamsIntersect(
          points.waistCrotch.shiftTowards(points.waistFront, sa).rotate(-90, points.waistCrotch),
          points.waistFront.shiftTowards(points.waistCrotch, sa).rotate(90, points.waistFront),
          drawOutseamFront().offset(sideSeamSa).start(),
          drawOutseamFront().offset(sideSeamSa).shiftFractionAlong(0.005)
        )

        paths.sa = new Path()
          .move(points.saFloorFront)
          .line(points.saFloorBack)
          .join(drawOutseamBack().offset(sideSeamSa))
          .line(points.saWaistBack)
          .line(points.saWaistCross)
          .join(paths.crossSeam.offset(crossSeamSa))
          .line(points.saWaistCrotch)
          .line(points.saWaistFront)
          .join(drawOutseamFront().offset(sideSeamSa))
          .line(points.saFloorFront)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
