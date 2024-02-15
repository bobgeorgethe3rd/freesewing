import { frontBase } from './frontBase.mjs'

export const buttonholePlacket = {
  name: 'jackson.buttonholePlacket',
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
    const keepThese = ['seam', 'placketCurve']
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
      .line(points.waistIn)
      .line(points.flyWaist)
      .close()
      .unhide()

    if (complete) {
      //grainline
      points.cutOnFoldFrom = points.flyCurveEnd
      points.cutOnFoldTo = points.waistIn
      macro('cutonfold', {
        from: points.cutOnFoldFrom,
        to: points.cutOnFoldTo,
      })
      //notches
      points.buttonholeBottomAnchor = points.flyCurveStart.shift(
        points.flyWaist.angle(points.waistIn),
        points.flyWaist.dist(points.waistIn) * 0.5
      )
      points.buttonholeTopAnchor = points.flyWaist.shiftFractionTowards(points.waistIn, 0.5)
      for (let i = 0; i < 6; i++) {
        if (i % 2 > 0) {
        } else {
          points['buttonhole' + i] = points.buttonholeBottomAnchor.shiftFractionTowards(
            points.buttonholeTopAnchor,
            (i + 1) / 6
          )
          snippets['buttonhole' + i] = new Snippet('buttonhole', points['buttonhole' + i])
            .attr('data-rotate', 180 - points.flyCurveStart.angle(points.flyWaist))
            .attr('data-scale', 2)
        }
      }
      //title
      points.title = points.flyCurveStart.shift(
        points.flyWaist.angle(points.waistIn),
        points.flyWaist.dist(points.waistIn) * 0.15
      )
      macro('title', {
        at: points.title,
        nr: 9,
        title: 'Buttonhole Placket',
        scale: 0.25,
        rotation: 90 - points.flyCurveStart.angle(points.flyWaist),
      })
      if (sa) {
        points.saWaistIn = utils.beamsIntersect(
          points.flyCurveEnd,
          points.waistIn,
          points.saWaistOut,
          points.saWaistIn
        )

        paths.sa = paths.placketCurve
          .offset(sa)
          .line(points.saWaistIn)
          .line(points.saFlyWaist)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
