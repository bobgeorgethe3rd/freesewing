import { pctBasedOn } from '@freesewing/core'
import { draftRectangle } from './shared.mjs'
import { body } from './body.mjs'

export const neckband = {
  name: 'stefan.neckband',
  after: body,
  options: {
    //Style
    neckbandWidth: {
      pct: 11.1,
      min: 1,
      max: 15,
      snap: 6.35,
      ...pctBasedOn('hpsToWaistBack'),
      menu: 'style',
    },
    neckbandOverlap: { pct: 0, min: 0, max: 10, menu: 'style' }, //3.8
    neckbandFolded: { bool: false, menu: 'style' },
    neckbandRuffles: { bool: true, menu: 'style' },
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
    const neckbandOverlap = measurements.neck * options.neckbandOverlap
    const xDist = store.get('neckbandLength') + neckbandOverlap * 2
    let yDist = absoluteOptions.neckbandWidth
    if (options.neckbandFolded && !options.neckbandRuffles) yDist = yDist * 2

    //paths & points
    paths.seam = draftRectangle(part, xDist, yDist)

    //details that are always needed
    if (neckbandOverlap > 0) {
      points.topLeftOverlap = points.topLeft.shift(0, neckbandOverlap)
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
    store.set('neckbandRuffleLength', xDist)
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
        nr: '5',
        title: 'Sleeve Band',
        scale: 0.25,
      })
      //foldline
      if (options.neckbandFolded && !options.neckbandRuffles) {
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
