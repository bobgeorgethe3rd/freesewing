import { back as backTitan } from '@freesewing/titan'
import { pctBasedOn } from '@freesewing/core'
import { pluginLogoRG } from '@freesewing/plugin-logorg'

export const back = {
  name: 'dalton.back',
  from: backTitan,
  hide: {
    from: true,
  },
  plugins: [pluginLogoRG],
  options: {
    //Fit
    kneeEase: { pct: 6, min: 0, max: 25, menu: 'fit' }, //altered from Titan
    ankleEase: { pct: 9.8, min: 0, max: 25, menu: 'fit' },
    heelEase: { pct: 7, min: 0, max: 25, menu: 'fit' },
    //Style
    legbandWidth: {
      pct: 0,
      min: 0,
      max: 6,
      snap: 5,
      ...pctBasedOn('waistToFloor'),
      menu: 'advanced',
    },
    fitKnee: { bool: true, menu: 'style' },
    fitFloor: { bool: true, menu: 'style' },
    lengthBonus: { pct: -10, min: -20, max: 10, menu: 'style' },
    //Darts
    backDartPlacement: { pct: 60, min: 40, max: 70, menu: 'darts' },
    backDartWidth: { pct: 3, min: 0, max: 6, menu: 'darts' },
    backDartDepth: { pct: 95, min: 45, max: 100, menu: 'darts' },
    //Construction
    hemWidth: { pct: 3, min: 1, max: 10, menu: 'construction' },
    //Advanced
    fitGuides: { bool: true, menu: 'advanced' },
    waistbandWidth: {
      pct: 0,
      min: 0,
      max: 6,
      snap: 5,
      ...pctBasedOn('waistToFloor'),
      menu: 'advanced',
    },
    backDartMultiplier: { count: 1, min: 0, max: 5, menu: 'advanced' },
    useHeel: { bool: true, menu: 'advanced' },
  },
  measurements: ['ankle', 'heel'],
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
    //removing paths and snippets not required from Titan
    for (let i in paths) delete paths[i]
    for (let i in snippets) delete snippets[i]
    //removing macros not required from Titan
    macro('title', false)
    macro('scalebox', false)
    //measures
    const backDartWidth =
      measurements.waist * options.backDartWidth +
      measurements.waist * options.backDartWidth * options.backDartMultiplier * options.waistHeight
    // const backDartDepth =
    // (measurements.waistToSeat -
    // measurements.waistToHips * (1 - options.waistHeight) -
    // absoluteOptions.waistbandWidth) *
    // options.backDartDepth

    const backDartDepth =
      (measurements.waistToSeat - measurements.waistToHips) * options.backDartDepth +
      measurements.waistToHips * options.waistHeight -
      absoluteOptions.waistbandWidth

    const ankle = measurements.ankle * (1 + options.ankleEase)
    const heel = measurements.heel * (1 + options.heelEase)

    let floorMeasure
    if (options.useHeel) {
      floorMeasure = heel
    } else {
      floorMeasure = ankle
    }

    const floor =
      floorMeasure +
      absoluteOptions.legbandWidth *
        ((store.get('kneeTotal') - floorMeasure) /
          (measurements.waistToFloor - measurements.waistToKnee))

    const floorBack = floor * options.legBalance
    const floorFront = floor * (1 - options.legBalance)
    store.set('floorFront', floorFront)
    // const kneeBack = measurements.knee * (1 + options.kneeEase) * options.legBalance

    //let's begin
    points.styleWaistOut = points.styleWaistIn.shiftOutwards(points.styleWaistOut, backDartWidth)
    points.styleWaistAnchor = points.styleWaistIn.shiftFractionTowards(
      points.styleWaistOut,
      options.backDartPlacement
    )

    let potSeatOut
    if (options.fitKnee) {
      if (points.waistOut.x > points.seatOut.x) {
        potSeatOut = utils.lineIntersectsCurve(
          points.seatOut.shift(points.waistOut.angle(points.waistIn), measurements.seat),
          points.seatOut.shift(points.waistIn.angle(points.waistOut), measurements.seat),
          points.kneeOut,
          points.kneeOutCp2,
          points.seatOut,
          points.styleWaistOut
        )
      } else {
        potSeatOut = points.seatOut
      }
    } else {
      if (points.waistOut.x > points.seatOut.x) {
        potSeatOut = utils.lineIntersectsCurve(
          points.seatOut.shift(points.waistOut.angle(points.waistIn), measurements.seat),
          points.seatOut.shift(points.waistIn.angle(points.waistOut), measurements.seat),
          points.floorOut,
          points.kneeOutCp2,
          points.seatOut,
          points.styleWaistOut
        )
      } else {
        potSeatOut = points.seatOut
      }
    }

    if (potSeatOut) {
      points.styleSeatOut = potSeatOut
    } else {
      points.styleSeatOut = points.seatOut
      log.warning('You may need to check you waistToSeat and crossSeam measures.')
    }

    points.styleSeatIn = utils.beamsIntersect(
      points.styleSeatOut,
      points.styleSeatOut.shift(points.waistOut.angle(points.waistIn), 1),
      points.styleWaistIn,
      points.crossSeamCurveStart
    )

    points.seatAnchor = points.styleSeatOut.shiftFractionTowards(
      points.styleSeatIn,
      options.backDartPlacement
    )

    points.dartIn = points.styleWaistOut.shiftFractionTowards(
      points.styleWaistIn,
      options.backDartPlacement
    )

    points.dartSeatTarget = utils.beamsIntersect(
      points.styleWaistAnchor,
      points.styleWaistIn.rotate(90, points.styleWaistAnchor),
      points.seatOut,
      points.seatOut.shift(points.styleWaistOut.angle(points.styleWaistIn), 1)
    )

    if (points.dartSeatTarget.y < points.seatAnchor.y) {
      points.dartSeat = points.seatAnchor.shiftFractionTowards(
        points.dartSeatTarget,
        1 - options.backDartPlacement
      )
    } else {
      points.dartSeat = points.seatAnchor.shiftFractionTowards(
        points.dartSeatTarget,
        options.backDartPlacement
      )
    }
    points.dartMid = utils.beamsIntersect(
      points.dartSeat,
      points.seatAnchor.rotate(-90, points.dartSeat),
      points.styleWaistIn,
      points.styleWaistOut
    )
    points.dartIn = points.dartMid.shiftTowards(points.styleWaistIn, backDartWidth / 2)
    points.dartOut = points.dartMid.shiftTowards(points.styleWaistOut, backDartWidth / 2)
    points.dartTip = points.dartMid.shiftTowards(points.dartSeat, backDartDepth)

    points.floor = points.floor.shiftTowards(points.knee, absoluteOptions.legbandWidth)
    points.floorIn = new Point(points.kneeIn.x, points.floor.y)
    points.floorOut = points.floorIn.flipX(points.floor)

    if (options.fitFloor) {
      // points.kneeOut = points.knee.shift(0, kneeBack / 2)
      // points.kneeIn = points.kneeOut.flipX(points.knee)

      points.floorIn = points.floor.shiftTowards(points.floorIn, floorBack / 2)
      points.floorOut = points.floor.shiftTowards(points.floorOut, floorBack / 2)

      points.floorInCp1 = points.floorIn.shift(90, points.knee.dy(points.floorIn) / 6)
      points.floorOutCp2 = points.floorOut.shift(90, points.knee.dy(points.floorOut) / 6)

      // points.kneeInCp2 = points.kneeIn.shift(-90, points.knee.dy(points.floorIn) / 3)
      // points.kneeOutCp1 = points.kneeOut.shift(-90, points.knee.dy(points.floorIn) / 3)

      points.kneeInCp1 = points.floorInCp1.shiftOutwards(
        points.kneeIn,
        points.fork.dy(points.knee) / 3
        // points.fork.dy(points.knee) * 0.6
        //points.knee.dy(points.floorIn) / 3
      )
      points.kneeOutCp2 = points.floorOutCp2.shiftOutwards(
        points.kneeOut,
        points.fork.dy(points.knee) / 3
        // points.fork.dy(points.knee) * 0.6
        //points.knee.dy(points.floorOut) / 3
      )
    }

    //draw paths

    // const drawInseam = () =>
    // options.fitKnee
    // ? new Path()
    // .move(points.fork)
    // .curve(points.forkCp2, points.kneeInCp1, points.kneeIn)
    // .line(points.floorIn)
    // : new Path().move(points.fork).curve(points.forkCp2, points.kneeInCp1, points.floorIn)

    const drawInseam = () => {
      if (options.fitKnee && !options.fitFloor) {
        return new Path()
          .move(points.fork)
          .curve(points.forkCp2, points.kneeInCp1, points.kneeIn)
          .line(points.floorIn)
      }
      if (options.fitFloor) {
        return new Path()
          .move(points.fork)
          .curve(points.forkCp2, points.kneeInCp1, points.kneeIn)
          ._curve(points.floorInCp1, points.floorIn)
      }
      if (!options.fitKnee && !options.fitFloor) {
        return new Path().move(points.fork).curve(points.forkCp2, points.kneeInCp1, points.floorIn)
      }
    }

    const drawOutseam = () => {
      let waistOut = points.styleWaistOut || points.waistOut
      if (options.fitKnee && !options.fitFloor) {
        if (points.waistOut.x > points.seatOut.x)
          return new Path()
            .move(points.floorOut)
            .line(points.kneeOut)
            .curve(points.kneeOutCp2, points.seatOut, waistOut)
        else
          return new Path()
            .move(points.floorOut)
            .line(points.kneeOut)
            .curve(points.kneeOutCp2, points.seatOutCp1, points.seatOut)
            .curve_(points.seatOutCp2, waistOut)
      }
      if (options.fitFloor) {
        if (points.waistOut.x > points.seatOut.x)
          return new Path()
            .move(points.floorOut)
            .curve_(points.floorOutCp2, points.kneeOut)
            .curve(points.kneeOutCp2, points.seatOut, waistOut)
        else
          return new Path()
            .move(points.floorOut)
            .curve_(points.floorOutCp2, points.kneeOut)
            .curve(points.kneeOutCp2, points.seatOutCp1, points.seatOut)
            .curve_(points.seatOutCp2, waistOut)
      }
      if (!options.fitKnee && !options.fitFloor) {
        if (points.waistOut.x > points.seatOut.x)
          return new Path().move(points.floorOut).curve(points.kneeOutCp2, points.seatOut, waistOut)
        else
          return new Path()
            .move(points.floorOut)
            .curve(points.kneeOutCp2, points.seatOutCp1, points.seatOut)
            .curve_(points.seatOutCp2, waistOut)
      }
    }

    //guides

    paths.hemBase = new Path().move(points.floorIn).line(points.floorOut).hide()

    paths.saBase = drawOutseam()
      .line(points.styleWaistIn)
      .line(points.crossSeamCurveStart)
      .curve(points.crossSeamCurveCp1, points.crossSeamCurveCp2, points.fork)
      .join(drawInseam())
      .hide()

    paths.seam = paths.hemBase
      .clone()
      .join(drawOutseam())
      .line(points.dartOut)
      .line(points.dartTip)
      .line(points.dartIn)
      .line(points.styleWaistIn)
      .line(points.crossSeamCurveStart)
      .curve(points.crossSeamCurveCp1, points.crossSeamCurveCp2, points.fork)
      .join(drawInseam())
      .close()
      .unhide()

    //setting up top circumference for curved waistband
    if (absoluteOptions.waistbandWidth > 0) {
      points.waistTopMid = points.dartMid
        .shiftTowards(points.styleWaistIn, absoluteOptions.waistbandWidth)
        .rotate(-90, points.dartMid)
      points.waistTopIn = utils.beamsIntersect(
        points.waistTopMid,
        points.dartMid.rotate(-90, points.waistTopMid),
        points.crossSeamCurveStart,
        points.styleWaistIn
      )
      points.waistTopOutTarget = points.waistTopMid
        .shiftTowards(points.dartMid, measurements.waist)
        .rotate(90, points.waistTopMid)

      if (options.waistHeight < 0.999) {
        //currently set to 0.999 as intersects fail when at 99.9%
        if (options.fitKnee || options.fitFloor) {
          if (points.waistOut.x > points.seatOut.x)
            points.waistTopOut = utils.lineIntersectsCurve(
              points.waistTopIn,
              points.waistTopOutTarget,
              points.kneeOut,
              points.kneeOutCp2,
              points.seatOut,
              points.waistOut
            )
          else
            points.waistTopOut = utils.lineIntersectsCurve(
              points.waistTopIn,
              points.waistTopOutTarget,
              points.seatOut,
              points.seatOutCp2,
              points.waistOut,
              points.waistOut
            )
        } else {
          if (points.waistOut.x > points.seatOut.x)
            points.waistTopOut = utils.lineIntersectsCurve(
              points.waistTopIn,
              points.waistTopOutTarget,
              points.floorOut,
              points.kneeOutCp2,
              points.seatOut,
              points.waistOut
            )
          else
            points.waistTopOut = utils.lineIntersectsCurve(
              points.waistTopIn,
              points.waistTopOutTarget,
              points.seatOut,
              points.seatOutCp2,
              points.waistOut,
              points.waistOut
            )
        }
      } else {
        points.waistTopOut = points.waistOut
      }

      // paths.waistTop = new Path()
      // .move(points.waistTopIn)
      // .line(points.waistTopOut)

      store.set('waistBackTop', points.waistTopIn.dist(points.waistTopOut))
    } else {
      log.warning('Curved waistband Back points not placed due to waistband width being 0')
    }

    //stores
    store.set(
      'waistBack',
      points.styleWaistIn.dist(points.dartIn) + points.dartOut.dist(points.styleWaistOut)
    )

    if (complete) {
      //grainline
      points.grainlineTo = points.floorIn.shiftFractionTowards(points.floor, 1 / 3)
      points.grainlineFrom = new Point(points.grainlineTo.x, points.crossSeamCurveCp1.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      snippets.crossSeamCurveStart = new Snippet('bnotch', points.crossSeamCurveStart)
      //title
      points.title = new Point(
        points.knee.shiftFractionTowards(points.kneeIn, 0.2).x,
        points.fork.y * 1.45
      )
      macro('title', {
        nr: 1,
        title: 'back',
        at: points.title,
      })

      //scalebox
      points.scalebox = points.knee.shiftFractionTowards(points.floor, 0.4)
      macro('scalebox', { at: points.scalebox })

      //logo
      points.logo = points.knee
      macro('logorg', {
        at: points.logo,
        scale: 0.9,
      })
      //Fit Guides
      if (options.fitGuides) {
        points.waistGuideIn = points.styleWaistIn.shiftFractionTowards(points.dartIn, 0.15)
        points.waistGuideOut = points.waistGuideIn.shiftFractionTowards(points.dartIn, 2 / 3)

        if (measurements.waistToHips * options.waistHeight - absoluteOptions.waistbandWidth > 0) {
          points.hipsGuideOut = points.waistGuideOut
            .shiftTowards(
              points.waistGuideIn,
              measurements.waistToHips * options.waistHeight - absoluteOptions.waistbandWidth
            )
            .rotate(90, points.waistGuideOut)
          points.hipsGuideIn = points.hipsGuideOut.shift(
            points.waistGuideOut.angle(points.waistGuideIn),
            points.waistGuideOut.dist(points.waistGuideIn)
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

        points.seatGuideOut = points.waistGuideOut
          .shiftTowards(
            points.waistGuideIn,
            measurements.waistToSeat -
              measurements.waistToHips * (1 - options.waistHeight) -
              absoluteOptions.waistbandWidth
          )
          .rotate(90, points.waistGuideOut)
        points.seatGuideIn = points.seatGuideOut.shift(
          points.waistGuideOut.angle(points.waistGuideIn),
          points.waistGuideOut.dist(points.waistGuideIn)
        )

        points.kneeGuideOut = points.kneeOut
        points.kneeGuideIn = points.kneeGuideOut.shiftTowards(
          points.kneeIn,
          points.waistGuideOut.dist(points.waistGuideIn)
        )

        paths.seatGuide = new Path()
          .move(points.seatGuideIn)
          .line(points.seatGuideOut)
          .attr('class', 'various')
          .attr('data-text', 'Seat Guide')
          .attr('data-text-class', 'left')

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
        paths.sa = paths.hemBase
          .offset(sa * options.hemWidth * 100)
          .join(paths.saBase.offset(sa))
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
