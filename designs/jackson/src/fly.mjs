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
    points.flyCurveStart = points.crotchSeamCurveStart
      .shiftTowards(points.styleWaistIn, flyWidth)
      .rotate(90, points.crotchSeamCurveStart)
    points.flyCurveCp1 = utils.beamsIntersect(
      points.flyOut,
      points.flyCurveStart,
      points.flyCrotch,
      points.flyCrotchAnchor.rotate(90, points.flyCrotch)
    )
    points.flyCurveCp2 = points.flyCrotch.shiftFractionTowards(points.flyCurveCp1, 1 / 3)

    paths.guide = new Path()
      .move(points.crotchSeamCurveStart)
      .line(points.styleWaistIn)
      .line(points.flyOut)
      .line(points.flyCurveStart.shiftFractionTowards(points.flyCurveCp1, 0.5))
      .curve(
        points.flyCurveCp1.shiftFractionTowards(points.flyCurveStart, 1 / 6),
        points.flyCurveCp2,
        points.flyCrotch
      )

    return part
  },
}
