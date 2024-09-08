import { pctBasedOn } from '@freesewing/core'
import { draftRectangle } from './shared.mjs'
import { body } from './body.mjs'

export const gore = {
  name: 'stefan.gore',
  after: body,
  options: {
    //Style
    goreWidth: { pct: 64.4, min: 20, max: 150, menu: 'style' },
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
    if (options.bodySideStyle != 'gores') {
      part.hide()
      return part
    }

    const xDist = measurements.neck * options.goreWidth
    const yDist = Math.sqrt(Math.pow(store.get('goreLength'), 2) - Math.pow(xDist, 2))

    //paths & points
    paths.seam = draftRectangle(part, xDist, yDist)

    //details that are always needed
    paths.cutline = new Path()
      .move(points.topLeft)
      .line(points.bottomRight)
      .attr('class', 'fabric help')
      .attr('data-text', 'Cut-line')
      .attr('data-text-class', 'center')

    if (complete) {
      //grainline
      points.grainlineFrom = new Point(points.topLeft.x * 0.75, points.topLeft.y * 0.5)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.bottom.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      macro('sprinkle', {
        snippet: 'bnotch',
        on: ['left', 'right'],
      })
      //title
      points.title = new Point(points.top.x, points.top.y * 0.5)
      macro('title', {
        at: points.title,
        nr: '9',
        title: 'Gore',
        scale: 0.5,
      })
      if (sa) {
        const bodyHemWidth = sa * options.bodyHemWidth * 100
        const sideSeamSa = sa * options.sideSeamSaWidth * 100

        paths.sa = draftRectangle(
          part,
          xDist + sideSeamSa * 2,
          yDist + bodyHemWidth * 2,
          false,
          'sa',
          0
        ).attr('class', 'fabric sa')
      }
    }
    return part
  },
}
