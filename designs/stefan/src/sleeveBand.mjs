import { draftRectangle } from './shared.mjs'
import { sleeve } from './sleeve.mjs'

export const sleeveBand = {
  name: 'stefan.sleeveBand',
  after: sleeve,
  options: {
    //Sleeves
    sleeveBandFolded: { bool: false, menu: 'sleeves' },
    sleeveBandRuffles: { bool: true, menu: 'sleeves' },
    sleeveBandOverlap: { pct: 0, min: 0, max: 20, menu: 'sleeves' }, //9,1
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
    log,
  }) => {
    if (!options.sleeveBands) {
      part.hide()
      return part
    }

    const sleeveBandOverlap = measurements.wrist * options.sleeveBandOverlap
    const xDist = store.get('wrist') + sleeveBandOverlap * 2
    let yDist = store.get('sleeveBandWidth')
    if (options.sleeveBandFolded && !options.sleeveBandRuffles) yDist = yDist * 2

    //paths & points
    paths.seam = draftRectangle(part, xDist, yDist)

    //details that are always needed
    if (sleeveBandOverlap > 0) {
      points.topLeftOverlap = points.topLeft.shift(0, sleeveBandOverlap)
      points.bottomLeftOverlap = new Point(points.topLeftOverlap.x, points.bottomLeft.y)
      points.bottomRightOverlap = points.bottomLeftOverlap.flipX(points.origin)
      points.topRightOverlap = points.topLeftOverlap.flipX(points.origin)

      paths.overlapLeft = new Path()
        .move(points.topLeftOverlap)
        .line(points.bottomLeftOverlap)
        .attr('class', 'mark help')
        .attr('data-text', 'Overlap Line')

      paths.overlapRight = new Path()
        .move(points.topRightOverlap)
        .line(points.bottomRightOverlap)
        .attr('class', 'mark help')
        .attr('data-text', 'Overlap line')
    }
    //stores
    store.set('sleeveBandRuffleLength', xDist)
    if (complete) {
      //grainline
      points.grainlineFrom = new Point(points.topLeft.x * 0.5, points.topLeft.y)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.bottom.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      macro('sprinkle', {
        snippet: 'notch',
        on: ['top', 'bottom'],
      })
      //title
      points.title = points.origin
      macro('title', {
        at: points.title,
        nr: '4',
        title: 'Sleeve Band',
        scale: 0.25,
      })
      //foldline
      if (options.sleeveBandFolded && !options.sleeveBandRuffles) {
        paths.foldline = new Path()
          .move(points.left)
          .line(points.right)
          .attr('class', 'mark')
          .attr('data-text', 'Fold-line')
      }
      if (sa) {
        paths.sa = draftRectangle(part, xDist + sa * 2, yDist + sa * 2, false, 'sa').attr(
          'class',
          'fabric sa'
        )
      }
    }
    return part
  },
}
