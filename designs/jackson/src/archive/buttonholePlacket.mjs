import { fly } from './fly.mjs'

export const buttonholePlacket = {
  name: 'jackson.buttonholePlacket',
  from: fly,
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
    //removing macros not required from Dalton
    macro('title', false)
    //begin
    paths.seamHalf = new Path()
      .move(points.flyOut)
      .line(points.flyCurveStart)
      .curve_(points.flyCurveCp1, points.flyCurveEnd)
      .hide()

    macro('mirror', {
      mirror: [points.styleWaistIn, points.flyCurveEnd],
      paths: ['seamHalf'],
      points: ['flyOut', 'flyCurveStart'],
      prefix: 'm',
    })
    //paths
    paths.seam = paths.seamHalf.clone().join(paths.mSeamHalf.reverse()).line(points.flyOut).close()

    if (complete) {
      //grainline
      points.grainlineFrom = points.styleWaistIn
      points.grainlineTo = points.flyCurveEnd
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //title
      points.title = points.flyCurveStart.shiftFractionTowards(points.flyCurveEnd, 0.25)
      macro('title', {
        nr: 9,
        title: 'Buttonhole Placket',
        at: points.title,
        scale: 1 / 3,
        rotation: 180 - points.mFlyOut.angle(points.flyOut),
      })
      //buttonholes
      points.bAnchor0 = points.flyCurveStart.shiftFractionTowards(points.mFlyCurveStart, 0.25)
      points.bAnchor1 = points.flyOut.shiftFractionTowards(points.mFlyOut, 0.25)
      for (let i = 0; i < 6; i++) {
        if (i % 2 > 0) {
        } else {
          points['buttonhole' + i] = points.bAnchor0.shiftFractionTowards(
            points.bAnchor1,
            (i + 1) / 6
          )
          snippets['buttonhole' + i] = new Snippet('buttonhole', points['buttonhole' + i])
            .attr('data-rotate', 90 - points.flyOut.angle(points.mFlyOut))
            .attr('data-scale', 2)
          // let buttonhole = 'buttonhole' + i
          macro('mirror', {
            mirror: [points.styleWaistIn, points.flyCurveEnd],
            points: ['buttonhole' + i],
            prefix: 'm',
          })
          snippets['mButtonhole' + i] = new Snippet('buttonhole', points['mButtonhole' + i])
            .attr('data-rotate', 90 - points.flyOut.angle(points.mFlyOut))
            .attr('data-scale', 2)
        }
      }
      if (sa) {
        paths.sa = paths.seam.clone().offset(sa).close().attr('class', 'fabric sa')
      }
    }

    return part
  },
}
