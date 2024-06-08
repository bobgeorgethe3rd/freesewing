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
    const legBackRatio = crossSeamBack / measurements.crossSeam
    const legFrontRatio = measurements.crossSeamFront / measurements.crossSeam

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
    points.upperLegRight = points.upperLeg.shiftOutwards(points.upperLegCrossAnchor, seatBack / 2)
    points.waistRightAnchor = points.upperLegRight
      .shiftTowards(points.upperLeg, toUpperLeg - toHips - waistbandWidth)
      .rotate(-90, points.upperLegRight)
    points.waistRight = points.waistCross.shift(
      points.waistCross.angle(points.waistRightAnchor),
      styleWaistBack * options.backLegRatio * 0.5
    )
    points.seatRight = points.seatCross.shift(
      points.waistCross.angle(points.waistRightAnchor),
      seatBack * options.backLegRatio * 0.5
    )
    //waistLeft
    points.upperLegLeftMid = points.upperLeg.shiftOutwards(
      points.upperLegCrotchAnchor,
      seatFront / 2
    )
    points.waistLeftMidAnchor = points.upperLegLeftMid
      .shiftTowards(points.upperLeg, toUpperLeg - toHips - waistbandWidth)
      .rotate(90, points.upperLegLeftMid)
    points.waistLeftMid = points.waistCrotch.shift(
      points.waistCrotch.angle(points.waistLeftMidAnchor),
      styleWaistFront / 2
    )
    points.seatLeftMid = points.seatCrotch.shift(
      points.waistCrotch.angle(points.waistLeftMidAnchor),
      seatFront / 2
    )
    points.waistLeft = points.waistLeftMid.shift(
      points.waistLeftMidAnchor.angle(points.upperLegLeftMid) -
        90 -
        (points.waistRightAnchor.angle(points.upperLegRight) -
          90 -
          points.waistRight.angle(points.waistCross)),
      styleWaistBack * (1 - options.backLegRatio) * 0.5
    )
    // if (options.fitWaistBack || waistBack > seatBack) {
    // points.seatLeft = points.waistLeft.shift(
    // points.waistRight.angle(points.seatRight),
    // points.waistRight.dist(points.seatRight)
    // )
    // } else {
    points.seatLeft = points.seatLeftMid.shift(
      points.waistLeftMid.angle(points.waistLeft),
      seatBack * (1 - options.backLegRatio) * 0.5
    )
    // }
    points.upperLegLeft = points.upperLegLeftMid.shift(
      points.waistLeftMid.angle(points.waistLeft),
      seatBack / 4
    )
    points.upperLegLeft = points.upperLegCrotchAnchor.shiftOutwards(
      points.upperLegLeftMid,
      seatBack * (1 - options.backLegRatio) * 0.5
    )
    // points.waistCrotchCp2 = points.waistCrotch.shiftTowards(points.waistLeftMid, styleWaistBack / 4)
    points.waistCrotchCp2 = points.waistCrotch.shiftFractionTowards(points.waistLeftMid, 0.5)
    //leg
    // points.upperLegAnchor = new Point(
    // (points.waistCross.x + points.waistLeft.x) / 2,
    // (points.waistRight.x + points.waistLeft.x) / 2,
    // points.waistCrotch.x,
    // points.upperLeg.y
    // )
    // points.upperLegAnchor = points.upperLeg.shift(180, knee * (1 - options.backLegRatio) * 0.5)

    points.upperLegRightMid = points.upperLegCrossAnchor.shiftFractionTowards(
      points.upperLegRight,
      options.backLegRatio
    )
    if (measurements.crossSeamFront > crossSeamBack) {
      points.upperLegRightAnchor = points.upperLegCrossAnchor.shiftFractionTowards(
        points.upperLegRightMid,
        0.5
      )
      points.upperLegFrontAnchor = points.upperLeg
        .shiftFractionTowards(points.upperLegCrotchAnchor, 0.5)
        .shiftFractionTowards(points.upperLegLeft, 0.5)
    } else {
      points.upperLegRightAnchor = points.upperLeg
        .shiftFractionTowards(points.upperLegCrossAnchor, 0.5)
        .shiftFractionTowards(points.upperLegRightMid, 0.5)
      points.upperLegLeftAnchor = points.upperLegCrotchAnchor.shiftFractionTowards(
        points.upperLegLeft,
        0.5
      )
    }

    points.kneeRightAnchor = points.upperLegRightAnchor
      .shiftTowards(points.upperLegRight, measurements.waistToKnee - toUpperLeg)
      .rotate(-90, points.upperLegRightAnchor)
    points.kneeLeftAnchor = points.upperLegLeftAnchor
      .shiftTowards(points.upperLegLeft, measurements.waistToKnee - toUpperLeg)
      .rotate(90, points.upperLegLeftAnchor)
    points.floorRightAnchor = points.upperLegRightAnchor.shiftTowards(
      points.kneeRightAnchor,
      toFloor - toUpperLeg
    )
    points.floorLeftAnchor = points.upperLegLeftAnchor.shiftTowards(
      points.kneeLeftAnchor,
      toFloor - toUpperLeg
    )

    points.kneeRight = points.kneeRightAnchor
      .shiftTowards(points.upperLegRightAnchor, knee * options.backLegRatio * 0.5)
      .rotate(-90, points.kneeRightAnchor)
    points.kneeLeft = points.kneeLeftAnchor
      .shiftTowards(points.upperLegLeftAnchor, knee * (1 - options.backLegRatio) * 0.5)
      .rotate(90, points.kneeLeftAnchor)

    points.knee = points.kneeLeft.shiftFractionTowards(points.kneeRight, 0.5)
    points.kneeRight = points.knee.shiftTowards(points.kneeRight, knee * 0.5)
    points.kneeLeft = points.knee.shiftTowards(points.kneeLeft, knee * 0.5)

    points.floor = points.knee
      .shiftTowards(points.kneeLeft, toFloor - measurements.waistToKnee)
      .rotate(90, points.knee)
    if (options.fitFloor) {
      points.floorRight = points.floor
        .shiftTowards(points.knee, floor * 0.5)
        .rotate(-90, points.floor)
    } else {
      points.floorRight = points.kneeRight
        .shiftTowards(points.knee, points.knee.dist(points.floor))
        .rotate(90, points.kneeRight)
    }
    points.floorLeft = points.floorRight.rotate(180, points.floor)

    points.waistRightI = utils.beamsIntersect(
      points.seatRight,
      points.seatRight.shift(points.upperLegRight.angle(points.waistRightAnchor), 1),
      points.waistCross,
      points.waistRight
    )
    points.waistLeftI = utils.beamsIntersect(
      points.seatLeft,
      points.seatLeft.shift(points.upperLegLeftMid.angle(points.waistLeftMidAnchor), 1),
      points.waistLeftMid,
      points.waistLeft
    )

    points.seatRightI = utils.beamsIntersect(
      points.waistRight,
      points.waistRight.shift(points.waistRightAnchor.angle(points.upperLegRight), 1),
      points.seatRight,
      points.seatRight.shift(points.upperLegRight.angle(points.waistRightAnchor) - 90, 1)
    )
    points.seatLeftI = utils.beamsIntersect(
      points.waistLeft,
      points.waistLeft.shift(points.waistLeftMidAnchor.angle(points.upperLegLeftMid), 1),
      points.seatLeft,
      points.seatLeft.shift(points.upperLegLeftMid.angle(points.waistLeftMidAnchor) + 90, 1)
    )

    points.seatRightCp2 = points.seatRight.shift(
      points.upperLegRight.angle(points.waistRightAnchor),
      points.seatRightI.dist(points.waistRight) / 2
    )
    points.seatLeftCp1 = points.seatLeft.shift(
      points.upperLegLeftMid.angle(points.waistLeftMidAnchor),
      points.seatLeftI.dist(points.waistLeft) / 2
    )

    if (points.waistRight.x > points.waistRightI.x) {
      points.seatRightCp2 = points.seatRight.shift(
        points.waistCross.angle(points.waistRight) + 90,
        points.seatRight.dist(points.seatRightCp2)
      )
    }

    if (points.waistLeft.x < points.waistLeftI.x) {
      points.seatLeftCp1 = points.seatLeft.shift(
        points.waistCrotch.angle(points.waistLeftMid) - 90,
        points.seatLeft.dist(points.seatLeftCp1)
      )
    }

    points.seatRightKneeAnchor = utils.beamsIntersect(
      points.upperLegRightAnchor,
      points.kneeRightAnchor,
      points.seatRight,
      points.seatRight.shift(points.upperLegRight.angle(points.waistRightAnchor) + 90, 1)
    )
    points.seatLeftKneeAnchor = utils.beamsIntersect(
      points.upperLegLeftAnchor,
      points.kneeLeftAnchor,
      points.seatLeft,
      points.seatLeft.shift(points.upperLegLeftMid.angle(points.waistLeftMidAnchor) - 90, 1)
    )

    if (options.fitKnee) {
      points.seatRightCp1 = points.seatRightCp2.shiftOutwards(
        points.seatRight,
        points.seatRightKneeAnchor.dist(points.kneeRightAnchor) / 3
      )
      points.seatLeftCp2 = points.seatLeftCp1.shiftOutwards(
        points.seatLeft,
        points.seatLeftKneeAnchor.dist(points.kneeLeftAnchor) / 3
      )
      points.floorRightCp2 = points.floorRight.shift(
        points.floor.angle(points.knee),
        points.floor.dist(points.knee) / 2
      )
      points.floorLeftCp1 = points.floorLeft.shift(
        points.floor.angle(points.knee),
        points.floor.dist(points.knee) / 2
      )
    } else {
      points.seatRightCp1 = points.seatRightCp2.shiftOutwards(
        points.seatRight,
        points.seatRightKneeAnchor.dist(points.upperLegRightAnchor) +
          (points.upperLegRightAnchor.dist(points.kneeRightAnchor) * 2) / 3
      )
      points.seatLeftCp2 = points.seatLeftCp1.shiftOutwards(
        points.seatLeft,
        points.seatLeftKneeAnchor.dist(points.upperLegLeftAnchor) +
          (points.upperLegLeftAnchor.dist(points.kneeLeftAnchor) * 2) / 3
      )
      points.floorRightCp2 = points.floorRight.shift(
        points.floor.angle(points.knee),
        points.floor.dist(points.knee)
      )
      points.floorLeftCp1 = points.floorLeft.shift(
        points.floor.angle(points.knee),
        points.floor.dist(points.knee)
      )
    }

    points.kneeRightCp2 = points.kneeRight.shift(
      points.floor.angle(points.knee),
      points.upperLegRightAnchor.dist(points.kneeRightAnchor) / 3
    )
    points.kneeLeftCp1 = points.kneeLeft.shift(
      points.floor.angle(points.knee),
      points.upperLegLeftAnchor.dist(points.kneeLeftAnchor) / 3
    )
    points.kneeRightCp1 = points.kneeRightCp2.shiftOutwards(
      points.kneeRight,
      points.knee.dist(points.floor) / 3
    )
    points.kneeLeftCp2 = points.kneeLeftCp1.shiftOutwards(
      points.kneeLeft,
      points.knee.dist(points.floor) / 3
    )

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

    if (
      points.waistRight.x > points.waistRightI.x &&
      points.seatRightAnchor.x < points.seatRight.x &&
      !options.fitKnee
    ) {
      points.floorRightCp2 = points.floorRightCp2.shiftTowards(
        points.floorRight,
        points.seatRightKneeAnchor.dist(points.kneeRightAnchor) / 3
      )
    }

    if (
      points.waistLeft.x < points.waistLeftI.x &&
      points.seatLeftAnchor.x > points.seatLeft.x &&
      !options.fitKnee
    ) {
      points.floorLeftCp1 = points.floorLeftCp1.shiftTowards(
        points.floorLeft,
        points.seatLeftKneeAnchor.dist(points.kneeLeftAnchor) / 3
      )
    }

    //paths
    const drawOutseamRight = () => {
      if (options.fitKnee) {
        if (points.seatRightAnchor.x > points.seatRight.x)
          return new Path()
            .move(points.floorRight)
            .curve(points.floorRightCp2, points.kneeRightCp1, points.kneeRight)
            .curve(points.kneeRightCp2, points.seatRight, points.waistRight)
        else
          return new Path()
            .move(points.floorRight)
            .curve(points.floorRightCp2, points.kneeRightCp1, points.kneeRight)
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
            .curve(points.kneeLeftCp2, points.floorLeftCp1, points.floorLeft)
        else
          return new Path()
            .move(points.waistLeft)
            ._curve(points.seatLeftCp1, points.seatLeft)
            .curve(points.seatLeftCp2, points.kneeLeftCp1, points.kneeLeft)
            .curve(points.kneeLeftCp2, points.floorLeftCp1, points.floorLeft)
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
      .line(points.waistRight)
      .line(points.waistCross)
      .join(paths.crossSeam)
      .join(paths.waistLeft)
      .join(drawOutseamLeft())
      .close()

    if (complete) {
      //grainline
      points.grainlineTo = points.floor.shiftFractionTowards(points.floorLeft, 2 / 3)
      points.grainlineFrom = points.grainlineTo.shift(
        points.floor.angle(points.knee),
        points.floor.dist(points.crotchSeamCurveEnd)
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
        points.upperLegLeftAnchor.shiftFractionTowards(points.upperLegRightAnchor, 0.5),
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
