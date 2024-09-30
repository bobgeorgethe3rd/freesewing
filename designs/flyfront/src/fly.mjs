import { flyBase } from './flyBase.mjs'

export const fly = {
  name: 'flyFront.fly',
  from: flyBase,
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
    //removing paths and snippets not required from Dalton
    const keepThese = ['seam', 'daltonGuide', 'placketCurve', 'crotchSeam']
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    if (options.daltonGuides && !paths.daltonGuide) {
      paths.daltonGuide = paths.seam.clone().attr('class', 'various lashed')
    }
    delete paths.seam
    for (let i in snippets) delete snippets[i]
    //let's begin
    //paths
    paths.seam = paths.placketCurve
      .clone()
      .line(points.flyCrotch)
      .join(paths.crotchSeam.split(points.flyCrotch)[1])
      .line(points.flyWaist)
      .close()

    if (complete) {
      //grainline
      points.grainlineFrom = points.flyWaist.shiftFractionTowards(points.waistIn, 0.15)
      points.grainlineTo = points.flyCurveStart.shift(
        points.waistOut.angle(points.waistIn),
        points.flyWaist.dist(points.grainlineFrom)
      )
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      snippets.flyCrotch = new Snippet('notch', points.flyCrotch)
      //title
      points.title = points.flyWaist
        .shiftFractionTowards(points.waistIn, 0.4)
        .shift(
          points.flyWaist.angle(points.flyCurveStart),
          points.flyWaist.dist(points.flyCurveStart) * 0.5
        )
      macro('title', {
        at: points.title,
        nr: 1,
        title: 'Fly',
        cutNr: 1,
        scale: 0.25,
        rotation: 90 - points.flyCurveStart.angle(points.flyWaist),
      })
      if (sa) {
        const crotchSeamSa = sa * options.crotchSeamSaWidth * 100

        paths.saCrotchSeam = paths.crotchSeam
          .split(points.flyCrotch)[1]
          .clone()
          .offset(crotchSeamSa)
          .hide()

        points.saFlyCrotch = utils.beamsIntersect(
          paths.saCrotchSeam.start(),
          paths.saCrotchSeam.shiftFractionAlong(0.01),
          points.flyCurveEnd.shiftTowards(points.flyCrotch, sa).rotate(-90, points.flyCurveEnd),
          points.flyCrotch.shiftTowards(points.flyCurveEnd, sa).rotate(90, points.flyCrotch)
        )

        paths.sa = paths.placketCurve
          .line(points.flyCrotch)
          .offset(sa)
          .line(points.saFlyCrotch)
          .join(paths.saCrotchSeam)
          .line(points.saWaistIn)
          .line(points.saFlyWaist)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
