import { backBase } from './backBase.mjs'

export const yokeBack = {
  name: 'jackson.yokeBack',
  from: backBase,
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
    log,
    absoluteOptions,
  }) => {
    //set render
    if (!options.yoke) {
      part.hide()
      return part
    }
    //removing paths and snippets not required from backBase
    for (let i in paths) delete paths[i]
    for (let i in snippets) delete snippets[i]

    //measurements
    const dartAngle = points.dartTip.angle(points.dartIn) - points.dartTip.angle(points.dartOut)
    //lets begin

    const rot = [
      'floorOut',
      'kneeOut',
      'kneeOutCp2',
      'seatOutCp1',
      'seatOut',
      'seatOutCp2',
      'styleWaistOut',
      'waistOut',
      'yokeOut',
    ]
    for (const p of rot) points[p + 'R'] = points[p].rotate(dartAngle, points.dartTip)

    if (points.floorOutCp2) {
      points.floorOutCp2R = points.floorOutCp2.rotate(dartAngle, points.dartTip)
    }

    //draw guide
    const drawOutseamR = () => {
      let waistOutR = points.styleWaistOutR || points.waistOutR
      if (options.fitKnee && !options.fitFloor) {
        if (points.waistOut.x > points.seatOut.x)
          return new Path()
            .move(points.floorOutR)
            .line(points.kneeOutR)
            .curve(points.kneeOutCp2R, points.seatOutR, waistOutR)
        else
          return new Path()
            .move(points.floorOutR)
            .line(points.kneeOutR)
            .curve(points.kneeOutCp2R, points.seatOutCp1R, points.seatOutR)
            .curve_(points.seatOutCp2R, waistOutR)
      }
      if (options.fitFloor) {
        if (points.waistOut.x > points.seatOut.x)
          return new Path()
            .move(points.floorOutR)
            .curve_(points.floorOutCp2R, points.kneeOutR)
            .curve(points.kneeOutCp2R, points.seatOutR, waistOutR)
        else
          return new Path()
            .move(points.floorOutR)
            .curve_(points.floorOutCp2R, points.kneeOutR)
            .curve(points.kneeOutCp2R, points.seatOutCp1R, points.seatOutR)
            .curve_(points.seatOutCp2R, waistOutR)
      }
      if (!options.fitKnee && !options.fitFloor) {
        if (points.waistOut.x > points.seatOut.x)
          return new Path()
            .move(points.floorOutR)
            .curve(points.kneeOutCp2R, points.seatOutR, waistOutR)
        else
          return new Path()
            .move(points.floorOutR)
            .curve(points.kneeOutCp2R, points.seatOutCp1R, points.seatOutR)
            .curve_(points.seatOutCp2R, waistOutR)
      }
    }

    paths.outSeam = drawOutseamR().split(points.yokeOutR)[1].hide()

    paths.crossSeam = new Path()
      .move(points.styleWaistIn)
      .line(points.crossSeamCurveStart)
      .curve(points.crossSeamCurveCp1, points.crossSeamCurveCp2, points.fork)
      .split(points.yokeIn)[0]
      .hide()

    //paths
    paths.yokeSeam = new Path()
      .move(points.yokeIn)
      .curve(points.dartTip, points.dartTip, points.yokeOutR)
      .hide()

    paths.waist = new Path()
      .move(points.styleWaistOutR)
      .curve(points.dartIn, points.dartIn, points.styleWaistIn)
      .hide()

    paths.seam = paths.yokeSeam
      .clone()
      .join(paths.outSeam)
      .join(paths.waist)
      .join(paths.crossSeam)
      .close()

    //stores
    store.set('waistBack', paths.yokeSeam.length() * 2)

    if (complete) {
      //grainline
      points.grainlineFrom = new Point(
        (points.dartIn.x + points.styleWaistIn.x) / 2,
        points.dartIn.y
      )
      points.grainlineTo = new Point(points.grainlineFrom.x, points.yokeIn.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //title
      points.title = points.dartTip.shiftFractionTowards(points.dartIn, 0.55)
      macro('title', {
        nr: '2',
        title: 'Yoke (Back)',
        at: points.title,
        scale: 0.375,
      })
      if (sa) {
        paths.sa = paths.yokeSeam
          .clone()
          .offset(sa * options.yokeSeamSaWidth * 100)
          .join(paths.outSeam.offset(sa * options.outSeamSaWidth * 100))
          .join(paths.waist.offset(sa))
          .join(paths.crossSeam.offset(sa * options.crossSeamSaWidth * 100))
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
