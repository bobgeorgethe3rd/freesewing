import { frontBase } from './frontBase.mjs'

export const fly = {
  name: 'jackson.fly',
  from: frontBase,
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
  }) => {
    //removing paths and snippets not required from Dalton
    const keepThese = ['seam', 'placketCurve', 'crotchSeam']
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    if (options.daltonGuides) {
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
        nr: 8,
        title: 'Fly',
        scale: 0.25,
        rotation: 90 - points.flyCurveStart.angle(points.flyWaist),
      })
      if (sa) {
        const crotchSeamSa = sa * options.crotchSeamSaWidth * 100
        const saFlyCrotch = utils.lineIntersectsCurve(
          points.flyCrotch.shift(points.waistIn.angle(points.crotchSeamCurveStart), sa),
          points.flyCrotch
            .shift(points.waistIn.angle(points.crotchSeamCurveStart), sa)
            .shift(
              points.waistIn.angle(points.crotchSeamCurveStart) + 90,
              points.waistOut.dist(points.waistIn)
            ),
          points.upperLegIn.shift(points.upperLegInCp1.angle(points.upperLegIn), crotchSeamSa),
          points.upperLegInCp2
            .shift(points.upperLegInCp1.angle(points.upperLegIn), crotchSeamSa)
            .shift(points.upperLegInCp2.angle(points.upperLegIn), crotchSeamSa),
          points.crotchSeamCurveStartCp1
            .shift(points.crotchSeamCurveStart.angle(points.crotchSeamCurveStartCp1), crotchSeamSa)
            .shift(
              points.crotchSeamCurveStart.angle(points.crotchSeamCurveStartCp1) + 90,
              crotchSeamSa
            ),
          points.crotchSeamCurveStart.shift(
            points.crotchSeamCurveStartCp1.angle(points.crotchSeamCurveStart) - 90,
            crotchSeamSa
          )
        )
        if (saFlyCrotch) {
          points.saFlyCrotch = saFlyCrotch
        } else {
          points.saFlyCrotch = utils.beamsIntersect(
            points.flyCurveEnd.shift(points.waistIn.angle(points.crotchSeamCurveStart), sa),
            points.flyCrotch.shift(points.waistIn.angle(points.crotchSeamCurveStart), sa),
            points.saWaistIn,
            points.saWaistIn.shift(points.waistIn.angle(points.crotchSeamCurveStart), 1)
          )
        }

        paths.sa = paths.placketCurve
          .line(points.flyCrotch)
          .offset(sa)
          .line(points.saFlyCrotch)
          .join(paths.crotchSeam.offset(crotchSeamSa).split(points.saFlyCrotch)[1])
          .line(points.saWaistIn)
          .line(points.saFlyWaist)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
