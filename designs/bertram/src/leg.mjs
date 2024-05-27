import { pctBasedOn } from '@freesewing/core'
import { pluginBundle } from '@freesewing/plugin-bundle'
import { draftCross } from '@freesewing/neville'

export const leg = {
  name: 'bertram.leg',
  options: {
    //Imported
    ...draftCross.options,
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
    backLegRatio: { pct: 50, min: 25, max: 75, menu: 'style' },
    legLengthBonus: { pct: 2, min: -20, max: 20, menu: 'style' },
    //Construction
    hemWidth: { pct: 2, min: 0, max: 3, menu: 'construction' },
    //Advanced
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
    ...draftCross.measurements,
    'ankle',
    'knee',
    'heel',
    'hips',
    'hipsBack',
    'waist',
    'waistBack',
    'waistToKnee',
  ],
  plugins: [pluginBundle],
  draft: (sh) => {
    //draft
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
      absoluteOptions,
    } = sh
    //draft
    draftCross.draft(sh)
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
    if (options.fitWaistBack || waistBack > seatBack) {
      void store.setIfUnset(
        'styleWaistBack',
        waistBack * options.waistHeight + hipsBack * (1 - options.waistHeight) + waistbandDiff
      )
    } else {
      void store.setIfUnset('styleWaistBack', seatBack)
    }
    const styleWaistBack = store.get('styleWaistBack')

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
    //waistRight
    points.upperLegRightAnchor = points.upperLegCrossAnchor.shift(0, seatBack / 2)
    points.waistRightAnchor = points.upperLegRightAnchor.shift(
      90,
      toUpperLeg - toHips - waistbandWidth
    )
    points.waistRight = points.waistCross.shift(
      points.waistCross.angle(points.waistRightAnchor),
      styleWaistBack * options.backLegRatio * 0.5
    )
    points.seatRight = points.seatCross.shift(
      points.waistCross.angle(points.waistRightAnchor),
      seatBack * options.backLegRatio * 0.5
    )
    //waistLeft
    points.upperLegLeftAnchor = points.upperLegCrotchAnchor.shift(180, seatFront / 2)
    points.waistLeftMidAnchor = points.upperLegLeftAnchor.shift(
      90,
      toUpperLeg - toHips - waistbandWidth
    )
    points.waistLeftMid = points.waistCrotch.shift(
      points.waistCrotch.angle(points.waistLeftMidAnchor),
      styleWaistFront / 2
    )
    points.seatLeftMid = points.seatCrotch.shift(
      points.waistCrotch.angle(points.waistLeftMidAnchor),
      seatFront / 2
    )
    points.waistLeft = points.waistLeftMid.shift(
      points.waistRight.angle(points.waistCross),
      styleWaistBack * (1 - options.backLegRatio) * 0.5
    )
    if (options.fitWaistBack || waistBack > seatBack) {
      points.seatLeft = points.waistLeft.shift(
        points.waistRight.angle(points.seatRight),
        points.waistRight.dist(points.seatRight)
      )
    } else {
      points.seatLeft = points.seatLeftMid.shift(
        points.seatRight.angle(points.seatCross),
        seatBack * (1 - options.backLegRatio) * 0.5
      )
    }
    // points.waistCrotchCp2 = points.waistCrotch.shiftTowards(points.waistLeftMid, styleWaistBack / 4)
    points.waistCrotchCp2 = points.waistCrotch.shiftFractionTowards(points.waistLeftMid, 0.5)
    //leg
    // points.upperLegAnchor = new Point(
    // (points.waistCross.x + points.waistLeft.x) / 2,
    // (points.waistRight.x + points.waistLeft.x) / 2,
    // points.waistCrotch.x,
    // points.upperLeg.y
    // )
    points.upperLegAnchor = points.upperLeg.shift(180, knee * (1 - options.backLegRatio) * 0.5)
    points.knee = points.upperLegAnchor.shift(-90, measurements.waistToKnee - toUpperLeg)
    points.kneeRight = points.knee.shift(0, knee * 0.5)
    points.kneeLeft = points.kneeRight.flipX(points.knee)

    points.seatRightCp2 = points.seatRight.shift(
      90,
      (points.waistRight.y - points.seatRight.y) / -2
    )
    points.seatRightCp1 = new Point(points.seatRight.x, (points.knee.y * 2) / 3)
    points.seatLeftCp1 = points.seatLeft.shift(90, (points.waistLeft.y - points.seatLeft.y) / -2)
    points.seatLeftCp2 = new Point(points.seatLeft.x, (points.knee.y * 2) / 3)
    points.floor = points.upperLegAnchor.shift(-90, toFloor - toUpperLeg)
    if (options.fitFloor) {
      points.floorRight = points.floor.shift(0, floor * 0.5)
    } else {
      points.floorRight = new Point(points.kneeRight.x, points.floor.y)
    }
    points.floorLeft = points.floorRight.flipX(points.floor)

    if (options.fitKnee) {
      points.floorRightCp2 = points.floorRight.shift(90, (points.floor.y - points.knee.y) / 2)
    } else {
      points.floorRightCp2 = new Point(points.floorRight.x, points.knee.y)
    }
    points.kneeRightCp2 = points.floorRightCp2.shiftOutwards(points.kneeRight, points.knee.y / 3)
    points.floorLeftCp1 = points.floorRightCp2.flipX(points.floor)
    points.kneeLeftCp1 = points.kneeRightCp2.flipX(points.floor)

    if (options.fitKnee) {
      points.seatRightAnchor = utils.lineIntersectsCurve(
        points.seatCross,
        points.seatCross.shiftFractionTowards(points.seatRight, 2),
        points.kneeRight,
        points.kneeRightCp2,
        points.seatRight,
        points.waistRight
      )
      points.seatLeftAnchor = utils.lineIntersectsCurve(
        points.seatLeftMid,
        points.seatLeftMid.shiftFractionTowards(points.seatLeft, 2),
        points.waistLeft,
        points.seatLeft,
        points.kneeLeftCp1,
        points.kneeLeft
      )
    } else {
      points.seatRightAnchor = utils.lineIntersectsCurve(
        points.seatCross,
        points.seatCross.shiftFractionTowards(points.seatRight, 2),
        points.floorRight,
        points.floorRightCp2,
        points.seatRight,
        points.waistRight
      )
      points.seatLeftAnchor = utils.lineIntersectsCurve(
        points.seatLeftMid,
        points.seatLeftMid.shiftFractionTowards(points.seatLeft, 2),
        points.waistLeft,
        points.seatLeft,
        points.floorLeftCp1,
        points.floorLeft
      )
    }
    //paths
    const drawOutseamRight = () => {
      if (options.fitKnee) {
        if (points.seatRightAnchor.x > points.seatRight.x)
          return new Path()
            .move(points.floorRight)
            .curve_(points.floorRightCp2, points.kneeRight)
            .curve(points.kneeRightCp2, points.seatRight, points.waistRight)
        else
          return new Path()
            .move(points.floorRight)
            .curve_(points.floorRightCp2, points.kneeRight)
            .curve(points.kneeRightCp2, points.seatRightCp1, points.seatRight)
            .curve_(points.seatRightCp2, points.waistRight)
      } else {
        if (points.seatRightAnchor.x > points.seatRight.x)
          return new Path()
            .move(points.floorRight)
            .curve(points.floorRightCp2, points.seatRight, points.waistRight)
        else
          return new Path()
            .move(points.floorRight)
            .curve(points.floorRightCp2, points.seatRightCp1, points.seatRight)
            .curve_(points.seatRightCp2, points.waistRight)
      }
    }

    paths.waistLeft = new Path()
      .move(points.waistCrotch)
      .curve(points.waistCrotchCp2, points.waistLeftMid, points.waistLeft)
      .hide()

    const drawOutseamLeft = () => {
      if (options.fitKnee) {
        if (points.seatLeftAnchor.x < points.seatLeft.x)
          return new Path()
            .move(points.waistLeft)
            .curve(points.seatLeft, points.kneeLeftCp1, points.kneeLeft)
            ._curve(points.floorLeftCp1, points.floorLeft)
        else
          return new Path()
            .move(points.waistLeft)
            ._curve(points.seatLeftCp1, points.seatLeft)
            .curve(points.seatLeftCp2, points.kneeLeftCp1, points.kneeLeft)
            ._curve(points.floorLeftCp1, points.floorLeft)
      } else {
        if (points.seatLeftAnchor.x < points.seatLeft.x)
          return new Path()
            .move(points.waistLeft)
            .curve(points.seatLeft, points.floorLeftCp1, points.floorLeft)
        else
          return new Path()
            .move(points.waistLeft)
            ._curve(points.seatLeftCp1, points.seatLeft)
            .curve(points.seatLeftCp2, points.floorLeftCp1, points.floorLeft)
      }
    }
    paths.hemBase = new Path().move(points.floorLeft).line(points.floorRight).hide()

    paths.seam = paths.hemBase
      .clone()
      .join(drawOutseamRight())
      .line(points.waistCross)
      .join(paths.crossSeam)
      .join(paths.waistLeft)
      .join(drawOutseamLeft())
      .close()

    if (complete) {
      //grainline
      points.grainlineTo = points.floor.shiftFractionTowards(points.floorLeft, 2 / 3)
      points.grainlineFrom = new Point(points.grainlineTo.x, points.waistLeftMid.y)
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
            .shift(points.waistCross.angle(points.waistRight), waistBack * 0.05)
          points.hipsGuideRight = points.hipsGuideCross.shift(
            points.waistCross.angle(points.waistRight),
            waistBack * 0.15 * options.backLegRatio
          )

          points.hipsGuideCrotch = points.waistCrotch
            .shiftTowards(
              points.crotchSeamCurveEnd,
              measurements.waistToHips * options.waistHeight - waistbandWidth
            )
            .shift(points.waistCrotch.angle(points.waistLeftMid), waistFront * 0.05)
          points.hipsGuideLeft = points.hipsGuideCrotch.shift(
            points.waistCrotch.angle(points.waistLeftMid),
            waistFront * 0.15
          )

          paths.hipsGuideRight = new Path()
            .move(points.hipsGuideCross)
            .line(points.hipsGuideRight)
            .attr('class', 'various')
            .attr('data-text', 'Hips Guide')
            .attr('data-text-class', 'left')

          paths.hipsGuideLeft = new Path()
            .move(points.hipsGuideLeft)
            .line(points.hipsGuideCrotch)
            .attr('class', 'various')
            .attr('data-text', 'Hips Guide')
            .attr('data-text-class', 'left')

          macro('sprinkle', {
            snippet: 'notch',
            on: ['hipsGuideCross', 'hipsGuideRight', 'hipsGuideCrotch', 'hipsGuideLeft'],
          })
        }
        points.seatGuideCross = points.seatCross.shift(
          points.waistCross.angle(points.waistRight),
          waistBack * 0.05
        )
        points.seatGuideRight = points.seatGuideCross.shift(
          points.waistCross.angle(points.waistRight),
          waistBack * 0.15 * options.backLegRatio
        )

        points.seatGuideCrotch = points.seatCrotch.shift(
          points.waistCrotch.angle(points.waistLeftMid),
          waistFront * 0.05
        )
        points.seatGuideLeft = points.seatGuideCrotch.shift(
          points.waistCrotch.angle(points.waistLeftMid),
          waistFront * 0.15
        )

        paths.seatGuideRight = new Path()
          .move(points.seatGuideCross)
          .line(points.seatGuideRight)
          .attr('class', 'various')
          .attr('data-text', 'Seat Guide')
          .attr('data-text-class', 'left')

        paths.seatGuideLeft = new Path()
          .move(points.seatGuideLeft)
          .line(points.seatGuideCrotch)
          .attr('class', 'various')
          .attr('data-text', 'Seat Guide')
          .attr('data-text-class', 'left')

        if (options.fitKnee) {
          points.kneeGuideRight = points.kneeRight
        } else {
          if (points.seatRightAnchor.x > points.seatRight.x) {
            points.kneeGuideRight = utils.lineIntersectsCurve(
              points.kneeLeft,
              points.kneeLeft.shiftFractionTowards(points.kneeRight, 2),
              points.floorRight,
              points.floorRightCp2,
              points.seatRight,
              points.waistRight
            )
          } else {
            points.kneeGuideRight = utils.lineIntersectsCurve(
              points.kneeLeft,
              points.kneeLeft.shiftFractionTowards(points.kneeRight, 2),
              points.floorRight,
              points.floorRightCp2,
              points.seatRightCp1,
              points.seatRight
            )
          }
        }
        points.kneeGuideCross = points.kneeGuideRight.shiftFractionTowards(points.kneeLeft, 0.25)
        paths.kneeGuideRight = new Path()
          .move(points.kneeGuideCross)
          .line(points.kneeGuideRight)
          .attr('class', 'various')
          .attr('data-text', 'Knee Guide')
          .attr('data-text-class', 'right')

        macro('sprinkle', {
          snippet: 'notch',
          on: [
            'seatGuideCross',
            'seatGuideRight',
            'seatGuideCrotch',
            'seatGuideLeft',
            'kneeGuideCross',
            'kneeGuideRight',
          ],
        })
      }
      if (sa) {
        const hemSa = sa * options.hemWidth * 100
        const sideSeamSa = sa * options.sideSeamSaWidth * 100
        const crossSeamSa = sa * options.crossSeamSaWidth * 100

        points.saFloorRight = points.floorRight.translate(sideSeamSa, hemSa)
        points.saFloorLeft = points.floorLeft.translate(-sideSeamSa, hemSa)

        points.saWaistRight = utils.beamsIntersect(
          drawOutseamRight().offset(sideSeamSa).shiftFractionAlong(0.995),
          drawOutseamRight().offset(sideSeamSa).end(),
          points.waistRight.shiftTowards(points.waistCross, sa).rotate(-90, points.waistRight),
          points.waistCross.shiftTowards(points.waistRight, sa).rotate(90, points.waistCross)
        )

        points.saWaistCross = utils.beamsIntersect(
          points.waistRight.shiftTowards(points.waistCross, sa).rotate(-90, points.waistRight),
          points.waistCross.shiftTowards(points.waistRight, sa).rotate(90, points.waistCross),
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
          points.waistCrotch.shiftTowards(points.waistLeftMid, sa).rotate(-90, points.waistCrotch),
          points.waistLeftMid.shiftTowards(points.waistCrotch, sa).rotate(90, points.waistLeftMid)
        )

        points.saWaistLeft = utils.beamsIntersect(
          points.waistLeftMid.shiftTowards(points.waistLeft, sa).rotate(-90, points.waistLeftMid),
          points.waistLeft.shiftTowards(points.waistLeftMid, sa).rotate(90, points.waistLeft),
          drawOutseamLeft().offset(sideSeamSa).start(),
          drawOutseamLeft().offset(sideSeamSa).shiftFractionAlong(0.005)
        )

        paths.sa = new Path()
          .move(points.saFloorLeft)
          .line(points.saFloorRight)
          .join(drawOutseamRight().offset(sideSeamSa))
          .line(points.saWaistRight)
          .line(points.saWaistCross)
          .join(paths.crossSeam.offset(crossSeamSa))
          .line(points.saWaistCrotch)
          .join(paths.waistLeft.offset(sa))
          .line(points.saWaistLeft)
          .join(drawOutseamLeft().offset(sideSeamSa))
          .line(points.saFloorLeft)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
