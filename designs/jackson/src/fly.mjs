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
      .hide()

    points.flyCrotchAnchor = paths.crotchSeam.shiftAlong(store.get('flyDepth') * 1.002) //glitches when 1.001

    points.flyOut = points.styleWaistIn.shiftFractionTowards(points.styleWaistOut, options.flyWidth)
    let flyWidth = points.styleWaistIn.dist(points.flyOut)
    points.flyCurveEnd = utils.beamsIntersect(
      points.styleWaistIn,
      points.crotchSeamCurveStart,
      points.flyCrotch,
      // points.flyCrotchAnchor.rotate(90, points.flyCrotch)
      points.flyCrotch.shift(points.styleWaistIn.angle(points.styleWaistOut), 1)
    )
    points.flyCurveCp1 = utils.beamsIntersect(
      points.flyOut,
      points.styleWaistOut.rotate(90, points.flyOut),
      points.flyCurveEnd,
      points.styleWaistIn.rotate(90, points.flyCurveEnd)
    )
    points.flyCurveStart = points.flyCurveEnd.rotate(90, points.flyCurveCp1)
    // paths.guide = new Path()
    // .move(points.crotchSeamCurveStart)
    // .line(points.styleWaistIn)
    // .line(points.flyOut)
    // .line(points.flyCurveStart)
    // .curve_(points.flyCurveCp1, points.flyCurveEnd)
    // .line(points.flyCrotch)

    //Paths
    let crotchSeamSplit = paths.crotchSeam.split(points.flyCrotch)
    for (let i in crotchSeamSplit) {
      paths['crotchSeam' + i] = crotchSeamSplit[i].hide()
    }

    paths.seam = new Path()
      .move(points.styleWaistIn)
      .line(points.flyOut)
      .line(points.flyCurveStart)
      .curve_(points.flyCurveCp1, points.flyCurveEnd)
      .line(points.flyCrotch)
      .join(paths.crotchSeam1)
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
        nr: 7,
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
          .join(paths.crotchSeam1.offset(sa * options.crotchSeamSaWidth * 100))
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
