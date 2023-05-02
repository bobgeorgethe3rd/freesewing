import { frontBase } from './frontBase.mjs'

export const fly = {
  name: 'jackson.fly',
  from: frontBase,
  hide: {
    from: true,
  },
  options: {},
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
    //removing paths and snippets not required from from
    for (let i in paths) delete paths[i]
    for (let i in snippets) delete snippets[i]
    //lets begin
    paths.crotchSeam = new Path()
      .move(points.fork)
      .curve(points.crotchSeamCurveCp1, points.crotchSeamCurveCp2, points.crotchSeamCurveStart)
      .line(points.styleWaistIn)
      .split(points.flyCrotch)[1]
      .hide()

    points.flyOut = points.styleWaistIn.shiftFractionTowards(points.styleWaistOut, options.flyWidth)

    points.flyCurveCp1 = utils.beamsIntersect(
      points.flyOut,
      points.flyOut.shift(points.styleWaistIn.angle(points.crotchSeamCurveStart), 1),
      points.flyCurveEnd,
      points.styleWaistIn.rotate(90, points.flyCurveEnd)
    )
    points.flyCurveStart = points.flyCurveCp1.shiftTowards(
      points.flyOut,
      points.flyCurveCp1.dist(points.flyCurveEnd)
    )

    //Paths
    paths.seam = new Path()
      .move(points.styleWaistIn)
      .line(points.flyOut)
      .line(points.flyCurveStart)
      .curve_(points.flyCurveCp1, points.flyCurveEnd)
      .line(points.flyCrotch)
      .join(paths.crotchSeam)
      .close()

    if (complete) {
      //grainline
      points.grainlineFrom = points.styleWaistIn.shiftFractionTowards(points.flyCurveEnd, 0.05)
      points.grainlineTo = points.flyCurveEnd.shiftFractionTowards(points.styleWaistIn, 0.05)
      macro('grainline', {
        from: points.styleWaistIn.rotate(90, points.grainlineFrom),
        to: points.flyCurveEnd.rotate(-90, points.grainlineTo),
      })
      //title
      points.title = points.flyOut
        .shiftFractionTowards(points.flyCurveStart, 0.6)
        .shift(
          points.flyOut.angle(points.styleWaistIn),
          points.flyOut.dist(points.styleWaistIn) * 0.1
        )
      macro('title', {
        nr: 8,
        title: 'Fly',
        at: points.title,
        scale: 1 / 3,
        rotation: 270 - points.styleWaistIn.angle(points.flyCurveEnd),
      })

      if (sa) {
        paths.sa = new Path()
          .move(points.styleWaistIn)
          .line(points.flyOut)
          .line(points.flyCurveStart)
          .curve_(points.flyCurveCp1, points.flyCurveEnd)
          .line(points.flyCrotch)
          .offset(sa)
          .join(paths.crotchSeam.offset(sa * options.crotchSeamSaWidth * 100))
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
