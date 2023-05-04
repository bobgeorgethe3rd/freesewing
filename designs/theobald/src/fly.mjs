import { frontBase } from './frontBase.mjs'

export const fly = {
  name: 'theobald.fly',
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
    //measures
    const suffix = store.get('frontPleatSuffix')
    //lets begin
    points['flyOut' + suffix] = points['styleWaistIn' + suffix].shiftTowards(
      points['styleWaistOut' + suffix],
      points.styleWaistIn.dist(points.styleWaistOut) * options.flyWidth
    )

    points['flyCurveCp1' + suffix] = utils.beamsIntersect(
      points['flyOut' + suffix],
      points['flyOut' + suffix].shift(
        points['styleWaistIn' + suffix].angle(points['crotchSeamCurveStart' + suffix]),
        1
      ),
      points['flyCurveEnd' + suffix],
      points['styleWaistIn' + suffix].rotate(90, points['flyCurveEnd' + suffix])
    )
    points['flyCurveStart' + suffix] = points['flyCurveCp1' + suffix].shiftTowards(
      points['flyOut' + suffix],
      points['flyCurveCp1' + suffix].dist(points['flyCurveEnd' + suffix])
    )

    //Paths
    paths['crotchSeam' + suffix] = new Path()
      .move(points['fork' + suffix])
      .curve(
        points['crotchSeamCurveCp1' + suffix],
        points['crotchSeamCurveCp2' + suffix],
        points['crotchSeamCurveStart' + suffix]
      )
      .line(points['styleWaistIn' + suffix])
      .split(points['flyCrotch' + suffix])[1]
      .hide()

    paths.seam = new Path()
      .move(points['styleWaistIn' + suffix])
      .line(points['flyOut' + suffix])
      .line(points['flyCurveStart' + suffix])
      .curve_(points['flyCurveCp1' + suffix], points['flyCurveEnd' + suffix])
      .line(points['flyCrotch' + suffix])
      .join(paths['crotchSeam' + suffix])
      .close()

    if (complete) {
      //grainline
      points.grainlineFrom = points['styleWaistIn' + suffix].shiftFractionTowards(
        points['flyCurveEnd' + suffix],
        0.05
      )
      points.grainlineTo = points['flyCurveEnd' + suffix].shiftFractionTowards(
        points['styleWaistIn' + suffix],
        0.05
      )
      macro('grainline', {
        from: points['styleWaistIn' + suffix].rotate(90, points.grainlineFrom),
        to: points['flyCurveEnd' + suffix].rotate(-90, points.grainlineTo),
      })
      //title
      points.title = points['flyOut' + suffix]
        .shiftFractionTowards(points['flyCurveStart' + suffix], 0.6)
        .shift(
          points['flyOut' + suffix].angle(points['styleWaistIn' + suffix]),
          points['flyOut' + suffix].dist(points['styleWaistIn' + suffix]) * 0.1
        )
      macro('title', {
        nr: 8,
        title: 'Fly',
        at: points.title,
        scale: 1 / 3,
        rotation: 270 - points['styleWaistIn' + suffix].angle(points['flyCurveEnd' + suffix]),
      })

      if (sa) {
        paths.sa = new Path()
          .move(points['styleWaistIn' + suffix])
          .line(points['flyOut' + suffix])
          .line(points['flyCurveStart' + suffix])
          .curve_(points['flyCurveCp1' + suffix], points['flyCurveEnd' + suffix])
          .line(points['flyCrotch' + suffix])
          .offset(sa)
          .join(paths['crotchSeam' + suffix].offset(sa * options.crotchSeamSaWidth * 100))
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
