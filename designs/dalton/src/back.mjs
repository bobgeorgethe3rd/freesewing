import { back as backTitan } from '@freesewing/titan'
import { pctBasedOn } from '@freesewing/core'

export const back = {
  name: 'back',
  from: backTitan,
  hideDependencies: true,
  options: {
    //Darts
    backDartPlacement: { pct: 50, min: 40, max: 60, menu: 'darts' },
    backDartWidth: { pct: 3, min: 1.1, max: 6, menu: 'darts' },
    backDartDepth: { pct: 95, min: 70, max: 95, menu: 'darts' },
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
  }) => {
    //removing paths and snippets not required from Titan
    for (let i in paths) delete paths[i]
    for (let i in snippets) delete snippets[i]
    //removing macros not required from Titan
    macro('title', false)
    macro('scalebox', false)
    //measures
    let backDartWidth = measurements.waist * options.backDartWidth
    let backDartDepth =
      (measurements.waistToSeat -
        measurements.waistToHips * (1 - options.waistHeight) -
        absoluteOptions.waistbandWidth) *
      options.backDartDepth

    //let's begin
    points.dartIn = points.styleWaistOut.shiftFractionTowards(
      points.styleWaistIn,
      options.backDartPlacement
    )
    points.dartOut = points.dartIn.shiftTowards(points.styleWaistOut, backDartWidth)
    points.styleWaistOut = points.dartIn.shiftOutwards(points.styleWaistOut, backDartWidth)
    points.dartMid = points.dartIn.shiftFractionTowards(points.dartOut, 0.5)
    points.dartTip = points.dartMid
      .shiftTowards(points.dartOut, backDartDepth)
      .rotate(-90, points.dartMid)

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
    paths.saBase = new Path()
      .move(points.styleWaistIn)
      .line(points.crossSeamCurveStart)
      .curve(points.crossSeamCurveCp1, points.crossSeamCurveCp2, points.fork)
      .join(drawInseam())
      .line(points.floorOut)
      .join(drawOutseam())
      .hide()

    paths.seam = paths.saBase
      .clone()
      .line(points.dartOut)
      .line(points.dartTip)
      .line(points.dartIn)
      .line(points.styleWaistIn)
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

      if (sa) {
        paths.sa = paths.saBase
          .line(points.styleWaistIn)
          .offset(sa)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
