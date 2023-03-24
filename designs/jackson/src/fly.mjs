import { frontBase } from './frontBase.mjs'

export const fly = {
  name: 'jackson.fly',
  from: frontBase,
  hide: {
    from: true,
  },
  options: {
    //Plackets
    flyWidth: { pct: 18.2, min: 18, max: 20, menu: 'plackets' },
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
    //removing paths and snippets not required from from
    for (let i in paths) delete paths[i]
    for (let i in snippets) delete snippets[i]
    //lets begin
    paths.crotchSeam = new Path()
      .move(points.fork)
      .curve(points.crotchSeamCurveCp1, points.crotchSeamCurveCp2, points.crotchSeamCurveStart)
      .line(points.styleWaistIn)

    points.flyCrotchAnchor = paths.crotchSeam.shiftAlong(store.get('flyDepth') * 1.001)

    points.flyOut = points.styleWaistIn.shiftFractionTowards(points.styleWaistOut, options.flyWidth)
    let flyWidth = points.styleWaistIn.dist(points.flyOut)
    points.flyCurveEnd = utils.beamsIntersect(
      points.styleWaistIn,
      points.crotchSeamCurveStart,
      points.flyCrotch,
      points.flyCrotchAnchor.rotate(90, points.flyCrotch)
    )
    points.flyCurveCp1 = utils.beamsIntersect(
      points.flyOut,
      points.styleWaistOut.rotate(90, points.flyOut),
      points.flyCurveEnd,
      points.styleWaistIn.rotate(90, points.flyCurveEnd)
    )
    points.flyCurveStart = points.flyCurveEnd.rotate(90, points.flyCurveCp1)
    paths.guide = new Path()
      .move(points.crotchSeamCurveStart)
      .line(points.styleWaistIn)
      .line(points.flyOut)
      .line(points.flyCurveStart)
      .curve_(points.flyCurveCp1, points.flyCurveEnd)
      .line(points.flyCrotch)

    return part
  },
}
