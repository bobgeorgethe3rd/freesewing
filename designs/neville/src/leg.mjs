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
    heelEase: { pct: 7.4, min: 0, max: 20, menu: 'fit' },
    ankleEase: { pct: 10.8, min: 0, max: 20, menu: 'fit' },
    fitGuides: { bool: true, menu: 'fit' },
    //Style
    fitWaist: { bool: true, menu: 'style' },
    fitKnee: { bool: false, menu: 'style' },
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
  measurements: ['ankle', 'knee', 'heel', 'hips', 'hipsBack', 'waist', 'waistBack', 'waistToKnee'],
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
    let legBandWidth = absoluteOptions.legBandWidth
    if (!options.legBandsBool) {
      legBandWidth = 0
    }
    const toFloor = measurements.waistToFloor * (1 + options.legLengthBonus) - legBandWidth
    // const legRBackatio = crossSeamBack / measurements.crossSeam
    // const legFrontatio = measurements.crossSeamFront / measurements.crossSeam

    let floor = measurements.heel * (1 + options.heelEase)
    if (!options.useHeel) {
      floor = measurements.ankle * (1 + options.ankleEase)
    }
    let legBandDiff
    if (options.calculateLegBandDiff) {
      legBandDiff = (legBandWidth * (knee - floor)) / (toFloor - measurements.waistToKnee)
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
    points.upperLegBackAnchor = points.upperLegCrossAnchor.shift(0, seatBack / 2)
    points.waistBackAnchor = points.upperLegBackAnchor.shift(
      90,
      toUpperLeg - toHips - waistbandWidth
    )
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
    points.upperLegFrontAnchor = points.upperLegCrotchAnchor.shift(180, seatFront / 2)
    points.waistFrontAnchor = points.upperLegFrontAnchor.shift(
      90,
      toUpperLeg - toHips - waistbandWidth
    )
    points.waistFront = points.waistCrotch.shift(
      points.waistCrotch.angle(points.waistFrontAnchor),
      styleWaistFront / 2
    )
    points.seatFront = points.seatCrotch.shift(
      points.waistCrotch.angle(points.waistFrontAnchor),
      seatFront / 2
    )
    //leg
    points.upperLegAnchor = new Point(
      (points.waistBack.shiftTowards(points.waistCross, backDartWidth).x + points.waistFront.x) / 2,
      points.upperLeg.y
    )
    points.knee = points.upperLegAnchor.shift(-90, measurements.waistToKnee - toUpperLeg)
    points.kneeBack = points.knee.shift(0, knee * 0.5)
    points.kneeFront = points.kneeBack.flipX(points.knee)

    points.seatBackCp2 = points.seatBack.shift(90, (points.waistBack.y - points.seatBack.y) / -2)
    // points.seatBackCp1 = points.seatBack.shift(-90, points.seatBack.dy(points.knee) / 3)
    points.seatBackCp1 = new Point(points.seatBack.x, (points.knee.y * 2) / 3)
    points.seatFrontCp1 = points.seatFront.shift(
      90,
      (points.waistFront.y - points.seatFront.y) / -2
    )
    // points.seatFrontCp2 = points.seatFrontCp1.shiftOutwards(points.seatFront, points.seatFront.dy(points.knee) / 3)
    points.seatFrontCp2 = new Point(points.seatFront.x, (points.knee.y * 2) / 3)

    points.floor = points.upperLegAnchor.shift(-90, toFloor - toUpperLeg)
    if (options.fitFloor) {
      points.floorBack = points.floor.shift(0, floor * 0.5)
    } else {
      points.floorBack = new Point(points.kneeBack.x, points.floor.y)
    }
    points.floorFront = points.floorBack.flipX(points.floor)

    if (options.fitKnee) {
      points.floorBackCp2 = points.floorBack.shift(90, (points.floor.y - points.knee.y) / 2)
    } else {
      points.floorBackCp2 = new Point(points.floorBack.x, points.knee.y)
    }
    points.kneeBackCp2 = points.floorBackCp2.shiftOutwards(points.kneeBack, points.knee.y / 3)
    points.floorFrontCp1 = points.floorBackCp2.flipX(points.floor)
    points.kneeFrontCp1 = points.kneeBackCp2.flipX(points.floor)

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
    //paths
    const drawOutseamBack = () => {
      if (options.fitKnee) {
        if (points.seatBackAnchor.x > points.seatBack.x)
          return new Path()
            .move(points.floorBack)
            .curve_(points.floorBackCp2, points.kneeBack)
            .curve(points.kneeBackCp2, points.seatBack, points.waistBack)
        else
          return new Path()
            .move(points.floorBack)
            .curve_(points.floorBackCp2, points.kneeBack)
            .curve(points.kneeBackCp2, points.seatBackCp1, points.seatBack)
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
        if (points.seatFrontAnchor.x < points.seatFront.x)
          return new Path()
            .move(points.waistFront)
            .curve(points.seatFront, points.kneeFrontCp1, points.kneeFront)
            ._curve(points.floorFrontCp1, points.floorFront)
        else
          return new Path()
            .move(points.waistFront)
            ._curve(points.seatFrontCp1, points.seatFront)
            .curve(points.seatFrontCp2, points.kneeFrontCp1, points.kneeFront)
            ._curve(points.floorFrontCp1, points.floorFront)
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

    //guide
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
      points.grainlineFrom = new Point(points.grainlineTo.x, points.upperLeg.y)
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
      points.title = points.knee.shiftFractionTowards(points.upperLegAnchor, 0.5)
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
          if (points.seatBackAnchor.x > points.seatBack.x) {
            points.kneeGuideBack = utils.lineIntersectsCurve(
              points.kneeFront,
              points.kneeFront.shiftFractionTowards(points.kneeBack, 2),
              points.floorBack,
              points.floorBackCp2,
              points.seatBack,
              points.waistBack
            )
          } else {
            points.kneeGuideBack = utils.lineIntersectsCurve(
              points.kneeFront,
              points.kneeFront.shiftFractionTowards(points.kneeBack, 2),
              points.floorBack,
              points.floorBackCp2,
              points.seatBackCp1,
              points.seatBack
            )
          }
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

        points.saFloorBack = points.floorBack.translate(sideSeamSa, hemSa)
        points.saFloorFront = points.floorFront.translate(-sideSeamSa, hemSa)

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
