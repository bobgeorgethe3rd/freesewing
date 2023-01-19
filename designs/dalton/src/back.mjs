import { back as backTitan } from '@freesewing/titan'
import { pctBasedOn } from '@freesewing/core'

export const back = {
  name: 'back',
  from: backTitan,
  hideDependencies: true,
  options: {
    //Fit
    // ankleEase: { pct: 2, min: 0, max: 10, menu: 'fit' },
    //Style
    // fitFloor: { bool: false, menu: 'style' },
    //Darts
    backDartPlacement: { pct: 50, min: 40, max: 60, menu: 'darts' },
    backDartWidth: { pct: 3, min: 0, max: 6, menu: 'darts' }, //1.1
    backDartDepth: { pct: 95, min: 70, max: 100, menu: 'darts' },
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
    // useHeel: { bool: false, menu: 'advanced' },
  },
  // measurements: ['ankle', 'heel'],
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

    // let ankle
    // if (options.useHeel) {
    // ankle = measurements.heel * (1 + options.ankleEase) * options.legBalance
    // } else {
    // ankle = measurements.ankle * (1 + options.ankleEase) * options.legBalance
    // }

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

    // if (options.fitFloor){
    // points.floorIn = points.floor.shiftTowards(points.floorIn, ankle / 2)
    // points.floorOut = points.floor.shiftTowards(points.floorOut, ankle / 2)

    // let seatPivot
    // if (points.waistOut.x > points.seatOut.x) {
    // seatPivot = points.seatOut
    // }
    // else {
    // seatPivot = points.seatOutCp1
    // }
    // points.floorInCp1 = utils.beamsIntersect(points.fork, points.kneeIn, points.floorIn, points.floorOut.rotate(90, points.floorIn))
    // points.floorOutCp2 = new Point(points.floorOut.x, points.floorInCp1.y)

    // points.kneeInCp1 = points.kneeIn.shiftFractionTowards(points.fork, 1 / 3)
    // points.kneeOutCp2 = points.kneeInCp1.flipX(points.floor)

    // }

    //draw paths

    const drawInseam = () =>
      options.fitKnee
        ? new Path()
            .move(points.fork)
            .curve(points.forkCp2, points.kneeInCp1, points.kneeIn)
            .line(points.floorIn)
        : new Path().move(points.fork).curve(points.forkCp2, points.kneeInCp1, points.floorIn)

    const drawOutseam = () => {
      let waistOut = points.styleWaistOut || points.waistOut
      if (options.fitKnee) {
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
      } else {
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
