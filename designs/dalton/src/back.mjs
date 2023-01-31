import { back as backTitan } from '@freesewing/titan'
import { pctBasedOn } from '@freesewing/core'

export const back = {
  name: 'dalton.back',
  from: backTitan,
  hideDependencies: true,
  options: {
    //Fit
    ankleEase: { pct: 2, min: 0, max: 10, menu: 'fit' },
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
    backDartPlacement: { pct: 50, min: 40, max: 60, menu: 'darts' },
    backDartWidth: { pct: 3, min: 0, max: 6, menu: 'darts' }, //1.1
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
    let backDartWidth =
      measurements.waist * options.backDartWidth +
      measurements.waist * options.backDartWidth * options.backDartMultiplier * options.waistHeight
    let backDartDepth =
      (measurements.waistToSeat -
        measurements.waistToHips * (1 - options.waistHeight) -
        absoluteOptions.waistbandWidth) *
      options.backDartDepth

    let ankle = measurements.ankle * (1 + options.ankleEase)
    let heel = measurements.heel * (1 + options.ankleEase)

    let floorMeasure
    if (options.useHeel) {
      floorMeasure = heel
    } else {
      floorMeasure = ankle
    }

    let floor =
      floorMeasure +
      absoluteOptions.legbandWidth *
        ((store.get('kneeTotal') - floorMeasure) /
          (measurements.waistToFloor - measurements.waistToKnee))

    let floorBack = floor * options.legBalance
    let floorFront = floor * (1 - options.legBalance)

    // let kneeBack = measurements.knee * (1 + options.kneeEase) * options.legBalance

    //let's begin
    points.dartIn = points.styleWaistOut.shiftFractionTowards(
      points.styleWaistIn,
      options.backDartPlacement
    )
    points.dartOut = points.dartIn.shiftTowards(points.styleWaistOut, backDartWidth)
    points.styleWaistOut = points.dartIn.shiftOutwards(points.styleWaistOut, backDartWidth)
    points.dartMid = points.dartIn.shiftFractionTowards(points.dartOut, 0.5)

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

    points.seatMid = points.styleSeatOut.shiftFractionTowards(
      points.styleSeatIn,
      options.backDartPlacement
    )

    points.dartTip = points.dartMid.shiftTowards(points.seatMid, backDartDepth)

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

    //stores
    store.set('floorFront', floorFront)

    if (complete) {
      //grainline
      points.grainlineTo = points.floorIn.shiftFractionTowards(points.floor, 1 / 3)
      points.grainlineFrom = new Point(points.grainlineTo.x, points.crossSeamCurveStart.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      snippets.bnotch = new Snippet('bnotch', points.crossSeamCurveStart)
      //title
      points.title = points.knee.shiftFractionTowards(points.kneeIn, 0.25)
      macro('title', {
        nr: 1,
        title: 'back',
        at: points.title,
      })

      //scalebox
      points.scalebox = points.knee.shiftFractionTowards(points.floor, 0.5)
      macro('scalebox', { at: points.scalebox })

      //Fit Guides
      if (options.fitGuides) {
        points.waistGuideIn = points.styleWaistIn.shiftFractionTowards(points.dartIn, 0.15)
        points.waistGuideOut = points.waistGuideIn.shiftFractionTowards(points.dartIn, 0.75)

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
