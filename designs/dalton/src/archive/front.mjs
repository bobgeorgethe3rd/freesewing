import { front as frontTitan } from '@freesewing/titan'
import { back } from './back.mjs'

export const front = {
  name: 'dalton.front',
  from: frontTitan,
  after: back,
  hide: {
    from: true,
  },
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
    // let kneeFront = measurements.knee * (1 + options.kneeEase) * (1 - options.legBalance)
    const floorFront = store.get('floorFront')

    points.floor = points.floor.shiftTowards(points.knee, absoluteOptions.legbandWidth)
    points.floorOut = new Point(points.kneeOut.x, points.floor.y)
    points.floorIn = points.floorOut.flipX(points.floor)

    if (options.fitFloor) {
      // points.kneeOut = points.knee.shift(180, kneeFront / 2)
      // points.kneeIn = points.kneeOut.flipX(points.knee)

      points.floorIn = points.floor.shiftTowards(points.floorIn, floorFront / 2)
      points.floorOut = points.floor.shiftTowards(points.floorOut, floorFront / 2)

      points.floorOutCp1 = points.floorOut.shift(90, points.knee.dy(points.floorOut) / 6)
      points.floorInCp2 = points.floorIn.shift(90, points.knee.dy(points.floorIn) / 6)

      points.kneeInCp2 = points.floorInCp2.shiftOutwards(
        points.kneeIn,
        points.fork.dy(points.knee) / 3
        // points.fork.dy(points.knee) * 0.6
        //points.knee.dy(points.floorIn) / 3
      )
      points.kneeOutCp1 = points.floorOutCp1.shiftOutwards(
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
    // .move(points.floorIn)
    // .line(points.kneeIn)
    // .curve(points.kneeInCp2, points.forkCp1, points.fork)
    // : new Path().move(points.floorIn).curve(points.kneeInCp2, points.forkCp1, points.fork)

    const drawInseam = () => {
      if (options.fitKnee && !options.fitFloor) {
        return new Path()
          .move(points.floorIn)
          .line(points.kneeIn)
          .curve(points.kneeInCp2, points.forkCp1, points.fork)
      }
      if (options.fitFloor) {
        return new Path()
          .move(points.floorIn)
          .curve_(points.floorInCp2, points.kneeIn)
          .curve(points.kneeInCp2, points.forkCp1, points.fork)
      }
      if (!options.fitKnee & !options.fitFloor) {
        return new Path().move(points.floorIn).curve(points.kneeInCp2, points.forkCp1, points.fork)
      }
    }

    const drawOutseam = () => {
      let waistOut = points.styleWaistOut || points.waistOut
      if (options.fitKnee && !options.fitFloor) {
        if (points.waistOut.x < points.seatOut.x)
          return new Path()
            .move(waistOut)
            .curve(points.seatOut, points.kneeOutCp1, points.kneeOut)
            .line(points.floorOut)
        else
          return new Path()
            .move(waistOut)
            ._curve(points.seatOutCp1, points.seatOut)
            .curve(points.seatOutCp2, points.kneeOutCp1, points.kneeOut)
            .line(points.floorOut)
      }
      if (options.fitFloor) {
        if (points.waistOut.x < points.seatOut.x)
          return new Path()
            .move(waistOut)
            .curve(points.seatOut, points.kneeOutCp1, points.kneeOut)
            ._curve(points.floorOutCp1, points.floorOut)
        else
          return new Path()
            .move(waistOut)
            ._curve(points.seatOutCp1, points.seatOut)
            .curve(points.seatOutCp2, points.kneeOutCp1, points.kneeOut)
            ._curve(points.floorOutCp1, points.floorOut)
      }
      if (!options.fitKnee && !options.fitFloor) {
        if (points.waistOut.x < points.seatOut.x)
          return new Path().move(waistOut).curve(points.seatOut, points.kneeOutCp1, points.floorOut)
        else
          return new Path()
            .move(waistOut)
            ._curve(points.seatOutCp1, points.seatOut)
            .curve(points.seatOutCp2, points.kneeOutCp1, points.floorOut)
      }
    }

    //seam paths

    paths.hemBase = new Path().move(points.floorOut).line(points.floorIn).hide()

    paths.saBase = drawInseam()
      .curve(points.crotchSeamCurveCp1, points.crotchSeamCurveCp2, points.crotchSeamCurveStart)
      .line(points.styleWaistIn)
      .line(points.styleWaistOut)
      .join(drawOutseam())
      .hide()

    paths.seam = paths.hemBase.clone().join(paths.saBase).close()

    //setting up top circumference for curved waistband
    if (absoluteOptions.waistbandWidth > 0) {
      points.styleWaistMid = points.styleWaistOut.shiftFractionTowards(points.styleWaistIn, 0.5)
      points.waistTopMid = points.styleWaistMid
        .shiftTowards(points.styleWaistIn, absoluteOptions.waistbandWidth)
        .rotate(90, points.styleWaistMid)
      points.waistTopIn = utils.beamsIntersect(
        points.waistTopMid,
        points.styleWaistMid.rotate(90, points.waistTopMid),
        points.crotchSeamCurveStart,
        points.styleWaistIn
      )
      points.waistTopOutTarget = points.waistTopMid
        .shiftTowards(points.styleWaistMid, measurements.waist)
        .rotate(-90, points.waistTopMid)

      if (options.waistHeight < 0.999) {
        if (options.fitKnee || options.fitFloor) {
          if (points.waistOut.x < points.seatOut.x)
            points.waistTopOut = utils.lineIntersectsCurve(
              points.waistTopMid,
              points.waistTopOutTarget,
              points.waistOut,
              points.seatOut,
              points.kneeOutCp1,
              points.kneeOut
            )
          else
            points.waistTopOut = utils.lineIntersectsCurve(
              points.waistTopMid,
              points.waistTopOutTarget,
              points.waistOut,
              points.waistOut,
              points.seatOutCp1,
              points.seatOut
            )
        } else {
          if (points.waistOut.x < points.seatOut.x)
            points.waistTopOut = utils.lineIntersectsCurve(
              points.waistTopMid,
              points.waistTopOutTarget,
              points.waistOut,
              points.seatOut,
              points.kneeOutCp1,
              points.floorOut
            )
          else
            points.waistTopOut = utils.lineIntersectsCurve(
              points.waistTopMid,
              points.waistTopOutTarget,
              points.waistOut,
              points.waistOut,
              points.seatOutCp1,
              points.seatOut
            )
        }
      } else {
        points.waistTopOut = points.waistOut
      }

      // paths.waistTop = new Path()
      // .move(points.waistTopOut)
      // .line(points.waistTopIn)

      store.set('waistFrontTop', points.waistTopOut.dist(points.waistTopIn))
    } else {
      log.warning('Curved waistband Front points not placed due to waistband width being 0')
    }
    //stores
    store.set('waistFront', points.styleWaistOut.dist(points.styleWaistIn))

    if (complete) {
      //grainline
      points.grainlineTo = points.floorIn.shiftFractionTowards(points.floor, 1 / 3)
      points.grainlineFrom = new Point(points.grainlineTo.x, points.crotchSeamCurveCp2.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      snippets.notch = new Snippet('notch', points.crotchSeamCurveStart)
      //title
      points.title = points.knee.shiftFractionTowards(points.kneeOut, 0.25)
      macro('title', {
        nr: 2,
        title: 'Front',
        at: points.title,
      })

      //Fit Guides
      if (options.fitGuides) {
        points.waistGuideIn = points.styleWaistIn.shiftFractionTowards(points.styleWaistOut, 3 / 40)
        points.waistGuideOut = points.waistGuideIn.shiftFractionTowards(
          points.styleWaistOut,
          10 / 36
        )

        if (measurements.waistToHips * options.waistHeight - absoluteOptions.waistbandWidth > 0) {
          points.hipsGuideOut = points.waistGuideOut
            .shiftTowards(
              points.waistGuideIn,
              measurements.waistToHips * options.waistHeight - absoluteOptions.waistbandWidth
            )
            .rotate(-90, points.waistGuideOut)
          points.hipsGuideIn = points.hipsGuideOut.shift(
            points.waistGuideOut.angle(points.waistGuideIn),
            points.waistGuideOut.dist(points.waistGuideIn)
          )
          paths.hipsGuide = new Path()
            .move(points.hipsGuideOut)
            .line(points.hipsGuideIn)
            .attr('class', 'various')
            .attr('data-text', 'Hips Guide')
            .attr('data-text-class', 'left')

          macro('sprinkle', {
            snippet: 'notch',
            on: ['hipsGuideOut', 'hipsGuideIn'],
          })
        }

        points.seatGuideOut = points.waistGuideOut
          .shiftTowards(
            points.waistGuideIn,
            measurements.waistToSeat -
              measurements.waistToHips * (1 - options.waistHeight) -
              absoluteOptions.waistbandWidth
          )
          .rotate(-90, points.waistGuideOut)
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
          .move(points.seatGuideOut)
          .line(points.seatGuideIn)
          .attr('class', 'various')
          .attr('data-text', 'Seat Guide')
          .attr('data-text-class', 'left')

        paths.kneeGuide = new Path()
          .move(points.kneeGuideOut)
          .line(points.kneeGuideIn)
          .attr('class', 'various')
          .attr('data-text', 'Knee Guide')
          .attr('data-text-class', 'left')

        macro('sprinkle', {
          snippet: 'notch',
          on: ['seatGuideOut', 'seatGuideIn', 'kneeGuideOut', 'kneeGuideIn'],
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
