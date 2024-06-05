import { pctBasedOn } from '@freesewing/core'
import { pluginBundle } from '@freesewing/plugin-bundle'
import { pluginLogoRG } from '@freesewing/plugin-logorg'

export const back = {
  name: 'dalton.back',
  plugins: [pluginBundle, pluginLogoRG],
  options: {
    //Constants
    waistbandStyle: 'straight',
    crossSeamSaWidth: 0.01,
    inseamSaWidth: 0.01,
    sideSeamSaWidth: 0.01,
    fitWaistBack: false,
    legBandsBool: true,
    //Fit
    waistEase: { pct: 3.2, min: 0, max: 20, menu: 'fit' },
    hipsEase: { pct: 3, min: 0, max: 20, menu: 'fit' },
    seatEase: { pct: 2.6, min: 0, max: 20, menu: 'fit' },
    kneeEase: { pct: 6.6, min: 0, max: 20, menu: 'fit' },
    heelEase: { pct: 7.4, min: 0, max: 20, menu: 'fit' },
    ankleEase: { pct: 10.8, min: 0, max: 20, menu: 'fit' },
    fitGuides: { bool: true, menu: 'fit' },
    //Style
    fitWaist: { bool: true, menu: 'style' },
    fitKnee: { bool: false, menu: 'style' },
    fitFloor: { bool: true, menu: 'style' },
    useHeel: { bool: true, menu: 'style' },
    crotchDrop: { pct: 2, min: 0, max: 15, menu: 'style' },
    waistHeight: { pct: 100, min: 0, max: 100, menu: 'style' },
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
    waistbandWidth: {
      pct: 0,
      min: 0,
      max: 6,
      snap: 5,
      ...pctBasedOn('waistToFloor'),
      menu: 'advanced',
    },
    crossSeamCurveAngle: { pct: 100, min: 0, max: 100, menu: 'advanced' },
    crossSeamCurveStart: { pct: 0, min: 0, max: 50, menu: 'advanced' },
    crossSeamCurveX: { pct: (1 / 3) * 100, min: 0, max: 50, menu: 'advanced' },
    crossSeamCurve: { pct: (2 / 3) * 100, min: 33.3, max: 100, menu: 'advanced' },
    useBackMeasures: { bool: true, menu: 'advanced' },
  },
  measurements: [
    'ankle',
    'crossSeam',
    'crossSeamFront',
    'knee',
    'heel',
    'hips',
    'hipsBack',
    'seat',
    'seatBack',
    'waist',
    'waistBack',
    'waistToHips',
    'waistToSeat',
    'waistToUpperLeg',
    'waistToKnee',
    'waistToFloor',
  ],
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
    }
    //measures
    const crossSeamBack = measurements.crossSeam - measurements.crossSeamFront
    let hipsBack
    let seatBack
    if (options.useBackMeasures) {
      void store.setIfUnset('waistBack', measurements.waistBack * (1 + options.waistEase))
      hipsBack = measurements.hipsBack * (1 + options.hipsEase)
      seatBack = measurements.seatBack * (1 + options.seatEase)
    } else {
      void store.setIfUnset('waistBack', measurements.waist * (1 + options.waistEase) * 0.5)
      hipsBack = measurements.hips * (1 + options.hipsEase) * 0.5
      seatBack = measurements.seat * (1 + options.seatEase) * 0.5
    }
    const waistBack = store.get('waistBack')
    const toUpperLeg = measurements.waistToUpperLeg * (1 + options.crotchDrop)
    const knee = measurements.knee * (1 + options.kneeEase)
    let legBandWidth = absoluteOptions.legBandWidth
    if (!options.legBandsBool) {
      legBandWidth = 0
    }
    const toHips = measurements.waistToHips * (1 - options.waistHeight)
    const toFloor = measurements.waistToFloor * (1 + options.legLengthBonus) - legBandWidth
    let waistbandWidth = absoluteOptions.waistbandWidth
    if (options.waistbandStyle == 'none') {
      waistbandWidth = 0
    }

    const legRatio = crossSeamBack / measurements.crossSeam

    let floor = measurements.heel * (1 + options.heelEase)
    if (!options.useHeel) {
      floor = measurements.ankle * (1 + options.ankleEase)
    }
    let legBandDiff
    if (options.calculateLegBandDiff) {
      legBandDiff =
        ((legBandWidth * (knee - floor)) / (toFloor - measurements.waistToKnee)) * legRatio
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

    //let's begin
    points.origin = new Point(0, 0)
    points.upperLegInAnchor = points.origin.shift(180, seatBack / 4)
    points.upperLegOutAnchor = points.upperLegInAnchor.flipX()
    let crossSeamCurveAngleMultiplier
    if (measurements.crossSeamFront > crossSeamBack) {
      crossSeamCurveAngleMultiplier = 1
      points.upperLegIn = points.upperLegInAnchor.shift(180, seatBack / 8)
    } else {
      crossSeamCurveAngleMultiplier = 0.5
      points.upperLegIn = points.upperLegInAnchor.shift(180, seatBack / 4)
    }
    points.crossSeamCurveStartMax = points.upperLegInAnchor.shift(
      90,
      toUpperLeg - measurements.waistToSeat
    )

    points.crossSeamCurveCpTarget = utils.beamsIntersect(
      points.upperLegIn,
      points.upperLegIn.shift(
        points.upperLegIn.angle(
          new Point(points.upperLegInAnchor.x, measurements.waistToKnee - toUpperLeg).rotate(
            90,
            points.upperLegIn
          )
        ) *
          options.crossSeamCurveAngle *
          crossSeamCurveAngleMultiplier,
        1
      ),
      points.crossSeamCurveStartMax,
      points.upperLegInAnchor.shiftFractionTowards(points.upperLegIn, options.crossSeamCurveX)
    )
    points.crossSeamCurveStart = points.crossSeamCurveCpTarget.shiftFractionTowards(
      points.crossSeamCurveStartMax,
      1 + options.crossSeamCurveStart
    )
    points.upperLegInCp1 = points.upperLegIn.shiftFractionTowards(
      points.crossSeamCurveCpTarget,
      options.crossSeamCurve
    )
    points.crossSeamCurveStartCp2 = points.crossSeamCurveStart.shiftFractionTowards(
      points.crossSeamCurveCpTarget,
      options.crossSeamCurve
    )

    points.waistInMax = points.crossSeamCurveCpTarget.shiftOutwards(
      points.crossSeamCurveStart,
      crossSeamBack -
        new Path()
          .move(points.crossSeamCurveStart)
          .curve(points.crossSeamCurveStartCp2, points.upperLegInCp1, points.upperLegIn)
          .length()
    )
    points.waistIn = points.waistInMax.shiftTowards(
      points.crossSeamCurveStart,
      toHips + waistbandWidth
    )
    points.seatIn = points.waistInMax.shiftTowards(
      points.crossSeamCurveStart,
      measurements.waistToSeat
    )

    //seat protection
    if (points.crossSeamCurveStart.y < points.seatIn.y) {
      points.crossSeamCurveStart = points.seatIn
      points.crossSeamCurveStartCp2 = points.crossSeamCurveStart.shiftFractionTowards(
        points.crossSeamCurveCpTarget,
        options.crossSeamCurve
      )

      points.waistInMax = points.crossSeamCurveCpTarget.shiftOutwards(
        points.crossSeamCurveStart,
        crossSeamBack -
          new Path()
            .move(points.crossSeamCurveStart)
            .curve(points.crossSeamCurveStartCp2, points.upperLegInCp1, points.upperLegIn)
            .length()
      )
      points.waistIn = points.waistInMax.shiftTowards(
        points.crossSeamCurveStart,
        toHips + waistbandWidth
      )
      points.seatIn = points.waistIn.shiftTowards(
        points.crossSeamCurveStart,
        measurements.waistToSeat - toHips - waistbandWidth
      )
    }

    // points.waistOutAnchorMax = points.upperLegOutAnchor.shift(90, toUpperLeg)
    points.waistOutAnchor = points.upperLegOutAnchor.shift(90, toUpperLeg - toHips - waistbandWidth) //points.waistOutAnchorMax.shift(-90, toHips + waistbandWidth)
    // if (options.fitWaistBack || waistBack > seatBack) {
    // points.waistOutMax = points.waistInMax.shift(points.waistInMax.angle(points.waistOutAnchorMax), waistBack / 2)
    // }
    // else {
    // points.waistOutMax = points.waistInMax.shift(points.waistInMax.angle(points.waistOutAnchorMax), seatBack / 2)
    // }
    points.waistOut = points.waistIn.shift(
      points.waistIn.angle(points.waistOutAnchor),
      styleWaistBack / 2
    )
    points.seatOut = points.seatIn.shift(points.waistIn.angle(points.waistOutAnchor), seatBack / 2)
    //dart
    points.waistDartAnchor = points.waistIn.shiftFractionTowards(
      points.waistOut,
      options.backDartPlacement
    )

    points.seatDartAnchor = points.seatOut.shiftFractionTowards(
      points.seatIn,
      options.backDartPlacement
    )

    points.seatDartTarget = utils.beamsIntersect(
      points.waistDartAnchor,
      points.waistIn.rotate(90, points.waistDartAnchor),
      points.seatOut,
      points.seatOut.shift(points.waistOut.angle(points.waistIn), 1)
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
      points.waistIn,
      points.waistOut
    )

    points.dartIn = points.dartMid.shiftTowards(points.waistIn, backDartWidth / 2)
    points.dartOut = points.dartIn.rotate(180, points.dartMid)
    points.dartTip = points.dartMid.shiftTowards(points.seatDart, backDartDepth)
    //leg
    if (measurements.crossSeamFront > crossSeamBack) {
      points.upperLeg = points.upperLegInAnchor.shiftFractionTowards(points.upperLegOutAnchor, 0.5)
    } else {
      points.upperLeg = points.upperLegIn
        .shiftFractionTowards(points.upperLegInAnchor, 0.5)
        .shiftFractionTowards(points.upperLegOutAnchor, 0.5)
    }
    points.knee = points.upperLeg.shift(-90, measurements.waistToKnee - toUpperLeg)
    points.kneeOut = points.knee.shift(0, knee * legRatio * 0.5)
    points.kneeIn = points.kneeOut.flipX(points.knee)
    points.seatOutCp2 = points.seatOut.shift(90, (points.waistOut.y - points.seatOut.y) / -2)
    points.seatOutCp1 = points.seatOut.shift(-90, points.seatOut.dy(points.knee) / 3)

    if (points.waistOut.x > points.seatOut.x) {
      points.seatOutCp2 = points.seatOut.shift(
        points.waistIn.angle(points.waistOut) + 90,
        points.seatOut.dist(points.seatOutCp2)
      )
      points.seatOutCp1 = points.seatOut.shift(
        points.waistIn.angle(points.waistOut) - 90,
        points.seatOut.dist(points.seatOutCp1)
      )
    }

    points.upperLegInCp2 = points.upperLegIn.shift(
      points.upperLegIn.angle(points.upperLegInCp1) - 90,
      points.knee.y / 3
    )
    points.floor = points.upperLeg.shift(-90, toFloor - toUpperLeg)
    if (options.fitFloor) {
      points.floorIn = points.floor.shift(180, floor * legRatio * 0.5)
    } else {
      points.floorIn = new Point(points.kneeIn.x, points.floor.y)
    }
    points.floorOut = points.floorIn.flipX(points.floor)
    if (options.fitKnee) {
      points.floorInCp1 = points.floorIn.shift(90, (points.floor.y - points.knee.y) / 2)
    } else {
      points.floorInCp1 = new Point(points.floorIn.x, points.knee.y)
    }
    points.floorOutCp2 = points.floorInCp1.flipX(points.floor)
    points.kneeInCp1 = points.floorInCp1.shiftOutwards(points.kneeIn, points.knee.y / 3)
    points.kneeOutCp2 = points.floorOutCp2.shiftOutwards(points.kneeOut, points.knee.y / 3)

    //paths
    if (options.fitKnee) {
      points.seatOutAnchor = utils.lineIntersectsCurve(
        points.seatIn,
        points.seatIn.shiftFractionTowards(points.seatOut, 2),
        points.kneeOut,
        points.kneeOutCp2,
        points.seatOut,
        points.waistOut
      )
    } else {
      points.seatOutAnchor = utils.lineIntersectsCurve(
        points.seatIn,
        points.seatIn.shiftFractionTowards(points.seatOut, 2),
        points.floorOut,
        points.floorOutCp2,
        points.seatOut,
        points.waistOut
      )
    }

    if (
      points.waistOut.x > points.seatOut.x &&
      points.seatOutAnchor.x < points.seatOut.x &&
      !options.fitKnee
    ) {
      points.floorOutCp2 = points.floorOutCp2.shiftTowards(
        points.floorOut,
        points.seatOut.dist(points.seatOutCp1)
      )
    }

    const drawOutseam = () => {
      if (options.fitKnee) {
        if (points.seatOutAnchor.x > points.seatOut.x)
          return new Path()
            .move(points.floorOut)
            .curve_(points.floorOutCp2, points.kneeOut)
            .curve(points.kneeOutCp2, points.seatOut, points.waistOut)
        else
          return new Path()
            .move(points.floorOut)
            .curve_(points.floorOutCp2, points.kneeOut)
            .curve(points.kneeOutCp2, points.seatOutCp1, points.seatOut)
            .curve_(points.seatOutCp2, points.waistOut)
      } else {
        if (points.seatOutAnchor.x > points.seatOut.x)
          return new Path()
            .move(points.floorOut)
            .curve(points.floorOutCp2, points.seatOut, points.waistOut)
        else
          return new Path()
            .move(points.floorOut)
            .curve(points.floorOutCp2, points.seatOutCp1, points.seatOut)
            .curve_(points.seatOutCp2, points.waistOut)
      }
    }

    const drawWaist = () =>
      options.backDartWidth == 0
        ? new Path().move(points.waistOut).line(points.waistIn)
        : new Path()
            .move(points.waistOut)
            .line(points.dartOut)
            .line(points.dartTip)
            .line(points.dartIn)
            .line(points.waistIn)

    const drawInseam = () =>
      options.fitKnee
        ? new Path()
            .move(points.upperLegIn)
            .curve(points.upperLegInCp2, points.kneeInCp1, points.kneeIn)
            ._curve(points.floorInCp1, points.floorIn)
        : new Path()
            .move(points.upperLegIn)
            .curve(points.upperLegInCp2, points.floorInCp1, points.floorIn)

    paths.hemBase = new Path().move(points.floorIn).line(points.floorOut).hide()

    paths.crossSeam = new Path()
      .move(points.waistIn)
      .line(points.crossSeamCurveStart)
      .curve(points.crossSeamCurveStartCp2, points.upperLegInCp1, points.upperLegIn)
      .hide()

    paths.seam = paths.hemBase
      .clone()
      .join(drawOutseam())
      .join(drawWaist())
      .join(paths.crossSeam)
      .join(drawInseam())
      .close()

    //stores
    store.set('crossSeamBack', crossSeamBack)
    store.set('toUpperLeg', toUpperLeg)
    store.set('knee', knee)
    store.set('waistbandDiff', waistbandDiff)
    store.set('waistbandBack', store.get('styleWaistBack'))
    store.set('legBandWidth', legBandWidth)
    store.set('toHips', toHips)
    store.set('toFloor', toFloor)
    store.set('waistbandWidth', waistbandWidth)
    store.set('floor', floor - legBandDiff)

    if (complete) {
      //grainline
      points.grainlineTo = points.floorIn.shiftFractionTowards(points.floor, 1 / 3)
      points.grainlineFrom = new Point(points.grainlineTo.x, points.crossSeamCurveStart.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      snippets.crossSeamCurveStart = new Snippet('bnotch', points.crossSeamCurveStart)
      //title
      points.title = new Point(points.knee.x, points.knee.y * 0.5)
      macro('title', {
        nr: 1,
        title: 'back',
        at: points.title,
        scale: 0.5,
      })
      //scalebox
      points.scalebox = new Point(points.knee.x, points.knee.y + points.knee.dy(points.floor) * 0.5)
      macro('scalebox', { at: points.scalebox })
      //fitGuides
      if (options.fitGuides) {
        if (measurements.waistToHips * options.waistHeight - waistbandWidth > 0) {
          points.hipsGuideIn = points.waistIn
            .shiftTowards(
              points.crossSeamCurveStart,
              measurements.waistToHips * options.waistHeight - waistbandWidth
            )
            .shift(points.waistIn.angle(points.waistOut), waistBack * 0.05)
          points.hipsGuideOut = points.hipsGuideIn.shift(
            points.waistIn.angle(points.waistOut),
            waistBack * 0.15
          )
          paths.hipsGuide = new Path()
            .move(points.hipsGuideIn)
            .line(points.hipsGuideOut)
            .attr('class', 'various')
            .attr('data-text', 'Hips Guide')
            .attr('data-text-class', 'left')

          macro('sprinkle', {
            snippet: 'notch',
            on: ['hipsGuideIn', 'hipsGuideOut'],
          })
        }
        points.seatGuideIn = points.seatIn.shift(
          points.waistIn.angle(points.waistOut),
          waistBack * 0.05
        )
        points.seatGuideOut = points.seatGuideIn.shift(
          points.waistIn.angle(points.waistOut),
          waistBack * 0.15
        )
        paths.seatGuide = new Path()
          .move(points.seatGuideIn)
          .line(points.seatGuideOut)
          .attr('class', 'various')
          .attr('data-text', 'Seat Guide')
          .attr('data-text-class', 'left')
        if (options.fitKnee) {
          points.kneeGuideOut = points.kneeOut
        } else {
          if (points.seatOutAnchor.x > points.seatOut.x) {
            points.kneeGuideOut = utils.lineIntersectsCurve(
              points.kneeIn,
              points.kneeIn.shiftFractionTowards(points.kneeOut, 2),
              points.floorOut,
              points.floorOutCp2,
              points.seatOut,
              points.waistOut
            )
          } else {
            points.kneeGuideOut = utils.lineIntersectsCurve(
              points.kneeIn,
              points.kneeIn.shiftFractionTowards(points.kneeOut, 2),
              points.floorOut,
              points.floorOutCp2,
              points.seatOutCp1,
              points.seatOut
            )
          }
        }
        points.kneeGuideIn = points.kneeGuideOut.shiftFractionTowards(points.kneeIn, 0.25)
        paths.kneeGuide = new Path()
          .move(points.kneeGuideIn)
          .line(points.kneeGuideOut)
          .attr('class', 'various')
          .attr('data-text', 'Knee Guide')
          .attr('data-text-class', 'right')

        macro('sprinkle', {
          snippet: 'notch',
          on: ['seatGuideIn', 'seatGuideOut', 'kneeGuideIn', 'kneeGuideOut'],
        })
      }

      if (sa) {
        const hemSa = sa * options.hemWidth * 100
        const sideSeamSa = sa * options.sideSeamSaWidth * 100
        const crossSeamSa = sa * options.crossSeamSaWidth * 100
        const inseamSa = sa * options.inseamSaWidth * 100

        points.saFloorOut = points.floorOut.translate(sideSeamSa, hemSa)

        points.saWaistOut = utils.beamsIntersect(
          points.waistOut.shiftTowards(points.waistIn, sa).rotate(-90, points.waistOut),
          points.waistIn.shiftTowards(points.waistOut, sa).rotate(90, points.waistIn),
          drawOutseam().offset(sideSeamSa).end(),
          drawOutseam().offset(sideSeamSa).shiftFractionAlong(0.99)
        )

        points.saWaistIn = utils.beamsIntersect(
          points.saWaistOut,
          points.saWaistOut.shift(points.waistOut.angle(points.waistIn), 1),
          points.waistIn
            .shiftTowards(points.crossSeamCurveStart, crossSeamSa)
            .rotate(-90, points.waistIn),
          points.crossSeamCurveStart
            .shiftTowards(points.waistIn, crossSeamSa)
            .rotate(90, points.crossSeamCurveStart)
        )

        points.saUpperLegIn = points.upperLegIn
          .shift(points.upperLegInCp2.angle(points.upperLegIn), crossSeamSa)
          .shift(points.upperLegInCp1.angle(points.upperLegIn), inseamSa)

        points.saFloorIn = points.floorIn.translate(-inseamSa, hemSa)

        paths.sa = paths.hemBase
          .offset(hemSa)
          .line(points.saFloorOut)
          .join(drawOutseam().offset(sideSeamSa))
          .line(points.saWaistOut)
          .line(points.saWaistIn)
          .join(paths.crossSeam.offset(crossSeamSa))
          .line(points.saUpperLegIn)
          .join(drawInseam().offset(inseamSa))
          .line(points.saFloorIn)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
