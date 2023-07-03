import { sleeve } from './sleeve.mjs'

export const sleeveBand = {
  name: 'rufflebutterflysleeve.sleeveBand',
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
    //renders
    //render false if sleeveBand is false
    if (options.sleeveTieChannel != 'band') {
      part.render = false
      return part
    }
    //measures
    const sleeveBandLength = store.get('sleeveBandLength') * 2
    const sleeveBandWidth = store.get('sleeveBandWidth') * 2

    //let's begin
    points.topLeft = new Point(0, 0)
    points.bottomLeft = points.topLeft.shift(-90, sleeveBandWidth)
    points.bottomRight = points.bottomLeft.shift(0, sleeveBandLength)
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
      //fold line
      points.foldlineFrom = points.topLeft.shiftFractionTowards(points.bottomLeft, 0.5)
      points.foldlineTo = new Point(points.topRight.x, points.foldlineFrom.y)
      paths.foldline = new Path()
        .move(points.foldlineFrom)
        .line(points.foldlineTo)
        .attr('class', 'various')
        .attr('data-text', 'Fold - line')
      //grainline
      points.grainlineFrom = points.topLeft.shiftFractionTowards(points.topRight, 0.5)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.bottomLeft.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      points.topEyeletLeft = points.topLeft.shiftFractionTowards(points.topRight, 0.05)
      points.topEyeletRight = points.topRight.shiftFractionTowards(points.topLeft, 0.05)
      points.bottomEyeletLeft = new Point(points.topEyeletLeft.x, points.foldlineFrom.y)
      points.bottomEyeletRight = new Point(points.topEyeletRight.x, points.foldlineFrom.y)
      let j
      for (let i = 0; i < 3; i++) {
        j = i + 3
        points['eyelet' + i] = points.bottomEyeletLeft.shiftFractionTowards(
          points.topEyeletLeft,
          (i + 1) / 4
        )
        points['eyelet' + j] = points.bottomEyeletRight.shiftFractionTowards(
          points.topEyeletRight,
          (i + 1) / 4
        )
        snippets['eyelet' + i] = new Snippet('notch', points['eyelet' + i])
        snippets['eyelet' + j] = new Snippet('notch', points['eyelet' + j])
      }
      //title
      points.title = points.topLeft
        .shiftFractionTowards(points.topRight, 0.25)
        .shift(-90, sleeveBandWidth / 4)
      macro('title', {
        at: points.title,
        nr: '5',
        title: 'Sleeve Bands',
        scale: 0.25,
      })
      if (sa) {
        paths.sa = paths.seam.offset(sa).attr('class', 'fabric sa')
      }
    }

    return part
  },
}
