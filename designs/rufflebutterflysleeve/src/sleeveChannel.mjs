import { sleeve } from './sleeve.mjs'

export const sleeveChannel = {
  name: 'rufflebutterflysleeve.sleeveChannel',
  after: sleeve,
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
    //render false if sleeveBand is false
    if (options.sleeveTieChannel != 'mid') {
      part.render = false
      return part
    }
    //measures
    const sleeveTieWidth = store.get('sleeveTieWidth')
    const sleeveSlitWidth = store.get('sleeveSlitWidth')
    const channelLength = store.get('sleeveChannelLengh')

    //let's begin
    points.topLeft = new Point(0, 0)
    points.bottomLeft = points.topLeft.shift(-90, sleeveTieWidth * 1.02)
    points.bottomRight = points.bottomLeft.shift(0, channelLength)
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
      //mid line
      points.topMid = points.topLeft.shiftFractionTowards(points.topRight, 0.5)
      points.bottomMid = new Point(points.topMid.x, points.bottomLeft.y)
      paths.midline = new Path()
        .move(points.topMid)
        .line(points.bottomMid)
        .attr('class', 'various')
        .attr('data-text', 'Mid-line')
        .attr('data-text-class', 'center')
      //slit sa
      points.slitTopLeft = points.topLeft.shiftTowards(points.topRight, sleeveSlitWidth)
      points.slitBottomLeft = new Point(points.slitTopLeft.x, points.bottomLeft.y)
      points.slitTopRight = points.slitTopLeft.flipX(points.topMid)
      points.slitBottomRight = points.slitBottomLeft.flipX(points.bottomMid)
      paths.slitLeft = new Path()
        .move(points.slitTopLeft)
        .line(points.slitBottomLeft)
        .attr('class', 'interfacing')
        .attr('data-text', 'Fold-line')

      paths.slitRight = new Path()
        .move(points.slitBottomRight)
        .line(points.slitTopRight)
        .attr('class', 'interfacing')
        .attr('data-text', 'Fold-line')
      //grainline
      points.grainlineFrom = points.topLeft.shiftFractionTowards(points.topRight, 0.75)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.bottomLeft.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      macro('sprinkle', {
        snippet: 'notch',
        on: ['topMid', 'bottomMid'],
      })
      //title
      points.title = points.topLeft
        .shiftFractionTowards(points.topRight, 0.25)
        .shift(-90, (sleeveTieWidth * 1.02) / 2)
      macro('title', {
        at: points.title,
        nr: '3',
        title: 'Sleeve Channel',
        cutNr: 2,
        scale: 0.12,
      })

      if (sa) {
        paths.sa = new Path()
          .move(points.topLeft.shift(90, sa))
          .line(points.bottomLeft.shift(-90, sa))
          .line(points.bottomRight.shift(-90, sa))
          .line(points.topRight.shift(90, sa))
          .line(points.topLeft.shift(90, sa))
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
