import { sleeve } from './sleeve.mjs'

export const sleeveTie = {
  name: 'rufflebutterflysleeve.sleeveTie',
  after: sleeve,
  hideDependencies: false,
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
    log,
  }) => {
    //measures
    let sleeveTieWidth = store.get('sleeveTieWidth')
    let sleeveTieLength = store.get('sleeveChannelLengh') * 2

    //let's begin
    points.topLeft = new Point(0, 0)
    points.bottomLeft = points.topLeft.shift(-90, sleeveTieWidth)
    points.bottomRight = points.bottomLeft.shift(0, sleeveTieLength)
    points.topRight = new Point(points.bottomRight.x, points.topLeft.y)

    //paths
    paths.seam = new Path()
      .move(points.topLeft)
      .line(points.bottomLeft)
      .line(points.bottomRight)
      .line(points.topRight)
      .line(points.topLeft)
      .close()

    if (complete) {
      //grainline
      points.grainlineFrom = points.topLeft.shiftFractionTowards(points.topRight, 0.5)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.bottomLeft.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //title
      points.title = points.topLeft
        .shiftFractionTowards(points.topRight, 0.25)
        .shift(-90, sleeveTieWidth / 2)
      macro('title', {
        at: points.title,
        nr: '4',
        title: 'Ruffle Butterfly Sleeve Tie',
        scale: 0.12,
      })
      if (sa) {
        paths.sa = paths.seam.offset(sa).attr('class', 'fabric sa')
      }
    }

    return part
  },
}
