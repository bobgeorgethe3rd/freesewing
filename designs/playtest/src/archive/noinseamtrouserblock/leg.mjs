import { pctBasedOn } from '@freesewing/core'
import { pluginBundle } from '@freesewing/plugin-bundle'
import { draftCross } from '@freesewing/neville'

export const leg = {
  name: 'playtest.leg',
  plugins: [pluginBundle],
  from: draftCross,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Constants
    inseamSaWidth: 0.01,
    crotchSeamSaWidth: 0.01,
    crossSeamSaWidth: 0.01,
    sideSeamSaWidth: 0.01,
    fitWaistBack: false,
    fitWaistFront: false,
    legBandsBool: true,
    //Fit
    waistEase: { pct: 3.2, min: 0, max: 20, menu: 'fit' },
    hipsEase: { pct: 3, min: 0, max: 20, menu: 'fit' },
    kneeEase: { pct: 6.6, min: 0, max: 20, menu: 'fit' },
    calfEase: { pct: 6.7, min: 0, max: 20, menu: 'fit' },
    heelEase: { pct: 7.6, min: 0, max: 20, menu: 'fit' },
    ankleEase: { pct: 10.8, min: 0, max: 20, menu: 'fit' },
    fitGuides: { bool: true, menu: 'fit' },
    //Style
    fitWaist: { bool: true, menu: 'style' },
    fitKnee: { bool: false, menu: 'style' },
    fitCalf: { bool: false, menu: 'style' },
    fitFloor: { bool: true, menu: 'style' },
    useHeel: { bool: true, menu: 'style' },
    legLengthBonus: { pct: 2, min: -20, max: 20, menu: 'style' },
    shapeWaist: { bool: false, menu: 'style' },
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
  draft: ({
    store,
    sa,
    Point,
    points,
    Path,
    paths,
    options,
    absoluteOptions,
    complete,
    paperless,
    macro,
    measurements,
    part,
    snippets,
    Snippet,
    utils,
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
    //let's begin
    //rotate
    const crotchPoints = [
      'upperLegCrotchCp2',
      'crotchSeamCurveCpTarget',
      'crotchSeamCurveEndCp1',
      'crotchSeamCurveEnd',
      'seatCrotch',
      'waistCrotch',
      'waistCrotchMax',
      'upperLegCrotchAnchor',
      'crotchSeamCurveEndMax',
    ]
    for (const p of crotchPoints)
      points[p] = points[p].rotate(-store.get('crotchSeamCurveAngle'), points.upperLeg)

    const crossPoints = [
      'upperLegCrossCp1',
      'crossSeamCurveCpTarget',
      'crossSeamCurveStartCp2',
      'crossSeamCurveStart',
      'seatCross',
      'waistCross',
      'waistCrossMax',
      'upperLegCrossAnchor',
      'crossSeamCurveStartMax',
    ]
    for (const p of crossPoints)
      points[p] = points[p].rotate(store.get('crossSeamCurveAngle'), points.upperLeg)
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

    const rotAngle =
      styleWaistBack + styleWaistFront >= seatBack + seatFront
        ? points.upperLegFront.angle(points.waistFront) -
          points.upperLegBack.angle(points.waistBack)
        : points.seatFront.angle(points.waistFront) - points.seatBack.angle(points.waistBack)
    const shiftDist =
      styleWaistBack + styleWaistFront >= seatBack + seatFront
        ? points.upperLegFront.dist(points.upperLegBack)
        : points.seatFront.dist(points.seatBack)
    const shiftAngle =
      styleWaistBack + styleWaistFront >= seatBack + seatFront
        ? points.upperLegFront.angle(points.upperLegBack)
        : points.seatFront.angle(points.seatBack)

    points.upperLegCross = points.upperLeg
    points.upperLegCrotch = points.upperLeg
    const shiftCrotch = [
      'upperLegCrotchCp2',
      'crotchSeamCurveCpTarget',
      'crotchSeamCurveEndCp1',
      'crotchSeamCurveEnd',
      'seatCrotch',
      'waistCrotch',
      'waistCrotchMax',
      'upperLegCrotchAnchor',
      'crotchSeamCurveEndMax',
      'upperLegFront',
      'waistFront',
      'seatFront',
      'upperLegCrotch',
    ]
    for (const p of shiftCrotch)
      points[p] = points[p]
        .shift(shiftAngle, shiftDist)
        .rotate(
          -rotAngle,
          styleWaistBack + styleWaistFront >= seatBack + seatFront
            ? points.upperLegBack
            : points.seatBack
        )
    //waist shaping
    points.waistFrontMid = points.waistCrotch.shiftFractionTowards(points.waistFront, 0.5)
    points.waistMid =
      points.waistBack.y < points.waistFront.y ? points.waistBack : points.waistFront
    //points.waistMid = points.waistBack.shiftFractionTowards(points.waistFront, 0.5)
    //leg
    // points.upperLegI = utils.beamsIntersect(
    // points.upperLegCrotch,
    // points.upperLegCrotchCp2,
    // points.upperLegCross,
    // points.upperLegCrossCp1,
    // )
    // points.upperLegAnchor = utils.beamsIntersect(
    // points.upperLegI,
    // points.upperLegI.shift(points.upperLegCrotch.angle(points.upperLegCross) + 90, 1),
    // points.upperLegCross,
    // points.upperLegCrotch
    // )

    points.upperLeg = points.upperLegCrotch.shiftFractionTowards(points.upperLegCross, 0.5)

    if (points.upperLeg.y < (points.upperLegBack.y || points.upperLegFront.y)) {
      points.upperLegAnchor = utils.beamsIntersect(
        points.upperLegBack.y > points.upperLegFront.y ? points.upperLegBack : points.upperLegFront,
        points.upperLegBack.y > points.upperLegFront.y
          ? points.upperLegBack.shift(points.upperLegCross.angle(points.upperLegCrotch) + 90, 1)
          : points.upperLegFront.shift(points.upperLegCross.angle(points.upperLegCrotch) + 90, 1),
        points.upperLegCross,
        points.upperLegCrotch
      )
      points.upperLeg = points.upperLegCross
        .shift(
          points.upperLegAnchor.angle(
            points.upperLegBack.y > points.upperLegFront.y
              ? points.upperLegBack
              : points.upperLegFront
          ),
          points.upperLegAnchor.dist(
            points.upperLegBack.y > points.upperLegFront.y
              ? points.upperLegBack
              : points.upperLegFront
          )
        )
        .shiftFractionTowards(
          points.upperLegCrotch.shift(
            points.upperLegAnchor.angle(
              points.upperLegBack.y > points.upperLegFront.y
                ? points.upperLegBack
                : points.upperLegFront
            ),
            points.upperLegAnchor.dist(
              points.upperLegBack.y > points.upperLegFront.y
                ? points.upperLegBack
                : points.upperLegFront
            )
          ),
          0.5
        )
    }

    points.knee = points.upperLeg.shift(
      points.upperLegCrotch.angle(points.upperLegCross) + 90,
      measurements.waistToKnee - toUpperLeg
    )
    points.kneeBack = points.knee.shift(
      points.upperLegCrotch.angle(points.upperLegCross),
      knee * 0.5
    )
    points.kneeFront = points.knee.shift(
      points.upperLegCross.angle(points.upperLegCrotch),
      knee * 0.5
    )

    points.calf = points.knee.shift(
      points.upperLegCrotch.angle(points.upperLegCross) + 90,
      measurements.waistToCalf - measurements.waistToKnee
    )
    points.calfBack = points.calf.shift(
      points.upperLegCrotch.angle(points.upperLegCross),
      calf * 0.5
    )
    points.calfFront = points.calf.shift(
      points.upperLegCross.angle(points.upperLegCrotch),
      calf * 0.5
    )

    points.floor = points.knee.shift(
      points.upperLegCrotch.angle(points.upperLegCross) + 90,
      toFloor - measurements.waistToKnee
    )
    if (options.fitFloor) {
      points.floorBack = points.floor.shift(
        points.upperLegCrotch.angle(points.upperLegCross),
        floor * 0.5
      )
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

    points.upperLegBackCp2 = points.upperLegCross.shift(
      points.upperLegCross.angle(points.upperLegCrossCp1) - 90,
      points.knee.dist(points.upperLeg) / 3
    )

    points.upperLegFrontCp1 = points.upperLegCrotch.shift(
      points.upperLegCrotch.angle(points.upperLegCrotchCp2) + 90,
      points.knee.dist(points.upperLeg) / 3
    )

    if (options.fitKnee || options.fitCalf) {
      if (options.fitCalf) {
        points.floorBackCp1 = points.floorBack.shift(
          points.floor.angle(points.knee),
          points.floor.dist(points.calf) / 2
        )
        points.floorFrontCp2 = points.floorFront.shift(
          points.floor.angle(points.knee),
          points.floor.dist(points.calf) / 2
        )
      } else {
        points.floorBackCp1 = points.floorBack.shift(
          points.floor.angle(points.knee),
          points.floor.dist(points.knee) / 2
        )
        points.floorFrontCp2 = points.floorFront.shift(
          points.floor.angle(points.knee),
          points.floor.dist(points.knee) / 2
        )
      }
    } else {
      points.floorBackCp1 = points.floorBack.shift(
        points.floor.angle(points.knee),
        points.floor.dist(points.knee)
      )
      points.floorFrontCp2 = points.floorFront.shift(
        points.floor.angle(points.knee),
        points.floor.dist(points.knee)
      )
    }

    points.kneeBackCp1 = points.kneeBack.shift(
      points.floor.angle(points.knee),
      points.upperLeg.dist(points.knee) / 3
    )
    points.kneeFrontCp2 = points.kneeFront.shift(
      points.floor.angle(points.knee),
      points.upperLeg.dist(points.knee) / 3
    )

    points.calfBackCp2 = points.calfBack.shift(
      points.knee.angle(points.floor),
      points.floor.dist(points.calf) / 3
    )

    points.calfFrontCp1 = points.calfFront.shift(
      points.knee.angle(points.floor),
      points.floor.dist(points.calf) / 3
    )

    if (options.fitCalf) {
      points.kneeBackCp2 = points.kneeBackCp1.shiftOutwards(
        points.kneeBack,
        points.knee.dist(points.calf) / 3
      )
      points.kneeFrontCp1 = points.kneeFrontCp2.shiftOutwards(
        points.kneeFront,
        points.knee.dist(points.calf) / 3
      )
    } else {
      points.kneeBackCp2 = points.kneeBackCp1.shiftOutwards(
        points.kneeBack,
        points.knee.dist(points.floor) / 3
      )
      points.kneeFrontCp1 = points.kneeFrontCp2.shiftOutwards(
        points.kneeFront,
        points.knee.dist(points.floor) / 3
      )
    }
    if (options.fitKnee) {
      points.calfBackCp1 = points.calfBackCp2.shiftOutwards(
        points.calfBack,
        points.calf.dist(points.knee) / 3
      )
      points.calfFrontCp2 = points.calfFrontCp1.shiftOutwards(
        points.calfFront,
        points.calf.dist(points.knee) / 3
      )
    } else {
      points.calfBackCp1 = points.calfBackCp2.shiftOutwards(
        points.calfBack,
        (measurements.waistToCalf - toUpperLeg) / 3
      )
      points.calfFrontCp2 = points.calfFrontCp1.shiftOutwards(
        points.calfFront,
        (measurements.waistToCalf - toUpperLeg) / 3
      )
    }
    //paths
    const drawInseamFront = () => {
      if (options.fitKnee) {
        if (options.fitCalf) {
          return new Path()
            .move(points.floorFront)
            .curve(points.floorFrontCp2, points.calfFrontCp1, points.calfFront)
            .curve(points.calfFrontCp2, points.kneeFrontCp1, points.kneeFront)
            .curve(points.kneeFrontCp2, points.upperLegFrontCp1, points.upperLegCrotch)
        } else {
          return new Path()
            .move(points.floorFront)
            .curve(points.floorFrontCp2, points.kneeFrontCp1, points.kneeFront)
            .curve(points.kneeFrontCp2, points.upperLegFrontCp1, points.upperLegCrotch)
        }
      } else {
        if (options.fitCalf) {
          return new Path()
            .move(points.floorFront)
            .curve(points.floorFrontCp2, points.calfFrontCp1, points.calfFront)
            .curve(points.calfFrontCp2, points.upperLegFrontCp1, points.upperLegCrotch)
        } else {
          return new Path()
            .move(points.floorFront)
            .curve(points.floorFrontCp2, points.upperLegFrontCp1, points.upperLegCrotch)
        }
      }
    }

    const drawWaist = () => {
      if (options.shapeWaist) {
        if (options.backDartWidth > 0) {
          return new Path()
            .move(points.waistCrotch)
            .line(points.waistFrontMid)
            .curve(points.waistFront, points.waistBack, points.dartOut)
            .line(points.dartTip)
            .line(points.dartIn)
            .line(points.waistCross)
        } else {
          return (
            new Path()
              .move(points.waistCrotch)
              // .line(points.waistFrontMid)
              .curve(points.waistMid, points.waistMid, points.waistCross)
          )
        }
      } else {
        if (options.backDartWidth > 0) {
          return new Path()
            .move(points.waistCrotch)
            .line(points.waistMid)
            .line(points.dartOut)
            .line(points.dartTip)
            .line(points.dartIn)
            .line(points.waistCross)
        } else {
          return new Path().move(points.waistCrotch).line(points.waistMid).line(points.waistCross)
        }
      }
    }

    const drawInseamBack = () => {
      if (options.fitKnee) {
        if (options.fitCalf) {
          return new Path()
            .move(points.upperLegCross)
            .curve(points.upperLegBackCp2, points.kneeBackCp1, points.kneeBack)
            .curve(points.kneeBackCp2, points.calfBackCp1, points.calfBack)
            .curve(points.calfBackCp2, points.floorBackCp1, points.floorBack)
        } else {
          return new Path()
            .move(points.upperLegCross)
            .curve(points.upperLegBackCp2, points.kneeBackCp1, points.kneeBack)
            .curve(points.kneeBackCp2, points.floorBackCp1, points.floorBack)
        }
      } else {
        if (options.fitCalf) {
          return new Path()
            .move(points.upperLegCross)
            .curve(points.upperLegBackCp2, points.calfBackCp1, points.calfBack)
            .curve(points.calfBackCp2, points.floorBackCp1, points.floorBack)
        } else {
          return new Path()
            .move(points.upperLegCross)
            .curve(points.upperLegBackCp2, points.floorBackCp1, points.floorBack)
        }
      }
    }

    paths.crotchSeam = new Path()
      .move(points.upperLegCrotch)
      .curve(points.upperLegCrotchCp2, points.crotchSeamCurveEndCp1, points.crotchSeamCurveEnd)
      .line(points.waistCrotch)
      .hide()

    paths.crossSeam = new Path()
      .move(points.waistCross)
      .line(points.crossSeamCurveStart)
      .curve(points.crossSeamCurveStartCp2, points.upperLegCrossCp1, points.upperLegCross)
      .hide()

    paths.seam = new Path()
      .move(points.floorBack)
      .line(points.floorFront)
      .join(drawInseamFront())
      .join(paths.crotchSeam)
      .join(drawWaist())
      .join(paths.crossSeam)
      .join(drawInseamBack())

    if (complete) {
      //grainline
      points.grainlineTo = points.floor.shiftFractionTowards(points.floorBack, 0.5)
      points.grainlineFrom = utils.beamsIntersect(
        points.grainlineTo,
        points.grainlineTo.shift(points.floor.angle(points.upperLeg), 1),
        points.dartTip,
        points.dartTip.shift(points.floor.angle(points.upperLeg) - 90, 1)
      )
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      snippets.crossSeamCurveStart = new Snippet('bnotch', points.crossSeamCurveStart)
      snippets.crotchSeamCurveEnd = new Snippet('notch', points.crotchSeamCurveEnd)
      //title
      points.titleAnchor = utils.beamsIntersect(
        points.floor,
        points.upperLeg,
        points.dartTip,
        points.dartTip.shift(points.floor.angle(points.upperLeg) - 90, 1)
      )
      points.title = points.titleAnchor.shiftFractionTowards(points.floor, 0.25)
      macro('title', {
        nr: 1,
        title: 'Leg',
        at: points.title,
        cutNr: 2,
        scale: 0.5,
        rotation: 90 - points.floor.angle(points.upperLeg),
      })
      //scalebox
      points.scalebox = points.titleAnchor.shiftFractionTowards(points.floor, 2 / 3)
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
          points.kneeGuideFront = points.kneeFront
        } else {
          points.kneeGuideFront = drawInseamFront().intersects(
            new Path()
              .move(points.knee)
              .line(points.knee.shiftFractionTowards(points.kneeFront, 10))
          )[0]
        }
        points.kneeGuideCrotch = points.kneeGuideFront.shiftFractionTowards(points.kneeBack, 0.25)
        paths.kneeGuideFront = new Path()
          .move(points.kneeGuideCrotch)
          .line(points.kneeGuideFront)
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
            'kneeGuideCrotch',
            'kneeGuideFront',
          ],
        })
      }
      if (sa) {
        const hemSa = sa * options.hemWidth * 100
        const inseamSa = sa * options.inseamSaWidth * 100
        const crotchSeamSa = sa * options.crossSeamSaWidth * 100
        const crossSeamSa = sa * options.crossSeamSaWidth * 100

        points.saFloorBack = points.floorBack
          .shift(points.floorFront.angle(points.floorBack), inseamSa)
          .shift(points.floorFront.angle(points.floorBack) + 90, hemSa)

        points.saFloorFront = points.floorFront
          .shift(points.floorBack.angle(points.floorFront), inseamSa)
          .shift(points.floorBack.angle(points.floorFront) - 90, hemSa)

        points.saUpperLegCrotch = points.upperLegCrotch
          .shift(points.upperLegFrontCp1.angle(points.upperLegCrotch), crotchSeamSa)
          .shift(points.upperLegCrotchCp2.angle(points.upperLegCrotch), inseamSa)

        points.saWaistCrotch = utils.beamsIntersect(
          points.crotchSeamCurveEnd
            .shiftTowards(points.waistCrotch, crotchSeamSa)
            .rotate(-90, points.crotchSeamCurveEnd),
          points.waistCrotch
            .shiftTowards(points.crotchSeamCurveEnd, crotchSeamSa)
            .rotate(90, points.waistCrotch),
          drawWaist().offset(sa).shiftFractionAlong(0.005),
          drawWaist().offset(sa).start()
        )

        points.saWaistCross = utils.beamsIntersect(
          points.waistCross
            .shiftTowards(points.crossSeamCurveStart, crotchSeamSa)
            .rotate(-90, points.waistCross),
          points.crossSeamCurveStart
            .shiftTowards(points.waistCross, crotchSeamSa)
            .rotate(90, points.crossSeamCurveStart),
          drawWaist().offset(sa).shiftFractionAlong(0.995),
          drawWaist().offset(sa).end()
        )

        points.saDartIn = utils.beamsIntersect(
          points.saWaistCross,
          points.saWaistCross.shift(
            points.waistCross.angle(options.backDartWidth > 0 ? points.dartIn : points.waistMid),
            1
          ),
          points.dartTip,
          points.dartIn
        )

        points.saWaistMid = utils.beamsIntersect(
          points.saWaistCrotch,
          points.saWaistCrotch.shift(points.waistCrotch.angle(points.waistMid), 1),
          options.backDartWidth > 0
            ? points.dartOut.shift(points.dartOut.angle(points.waistMid) + 90, sa)
            : points.saWaistCross,
          options.backDartWidth > 0
            ? points.dartOut
                .shift(points.dartOut.angle(points.waistMid) + 90, sa)
                .shift(points.dartOut.angle(points.waistMid), 1)
            : points.saWaistCross.shift(points.waistCross.angle(points.waistMid), 1)
        )

        points.saDartOut = utils.beamsIntersect(
          points.saWaistMid,
          points.saWaistMid.shift(
            points.waistMid.angle(options.backDartWidth > 0 ? points.dartOut : points.waistCross),
            1
          ),
          points.dartTip,
          points.dartOut
        )

        const drawSaWaist = () => {
          if (options.shapeWaist) {
            if (options.backDartWidth > 0) {
              return new Path()
                .move(points.waistCrotch)
                .line(points.waistFrontMid)
                .curve(points.waistFront, points.waistBack, points.dartOut)
                .line(points.waistCross)
                .offset(sa)
            } else {
              return new Path()
                .move(points.waistCrotch)
                .curve(points.waistMid, points.waistMid, points.waistCross)
                .offset(sa)
            }
          } else {
            return new Path()
              .move(points.saWaistCrotch)
              .line(points.saWaistMid)
              .line(points.saDartOut)
              .line(points.saDartIn)
              .line(points.saWaistCross)
          }
        }

        points.saUpperLegCross = points.upperLegCross
          .shift(points.upperLegCrossCp1.angle(points.upperLegCross), inseamSa)
          .shift(points.upperLegBackCp2.angle(points.upperLegCross), crossSeamSa)

        paths.sa = new Path()
          .move(points.saFloorBack)
          .line(points.saFloorFront)
          .join(drawInseamFront().offset(inseamSa))
          .line(points.saUpperLegCrotch)
          .join(paths.crotchSeam.offset(crotchSeamSa))
          .line(points.saWaistCrotch)
          .join(drawSaWaist())
          .line(points.saWaistCross)
          .join(paths.crossSeam.offset(crossSeamSa))
          .line(points.saUpperLegCross)
          .join(drawInseamBack().offset(inseamSa))
          .line(points.saFloorBack)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
