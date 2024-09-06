import { draftRectangle } from './shared.mjs'
import { body } from './body.mjs'

export const sleeveGusset = {
  name: 'stefan.sleeveGusset',
  after: body,
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
    if (options.taperedSleeves && options.sleeveFullness <= 0) {
      part.hide()
      return part
    }

    const xDist = store.get('sleeveGussetWidth')
    const yDist = xDist

    //paths & points
    paths.seam = draftRectangle(part, xDist, yDist)

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
        on: ['topLeft', 'bottomLeft', 'bottomRight', 'topRight'],
      })
      //title
      points.title = points.origin
      macro('title', {
        at: points.title,
        nr: '3',
        title: 'Sleeve Gusset',
        scale: 0.25,
      })
      if (sa) {
        const sideSeamSa = sa * options.sideSeamSaWidth * 100

        paths.sa = draftRectangle(
          part,
          xDist + sideSeamSa * 2,
          yDist + sideSeamSa * 2,
          false,
          'sa'
        ).attr('class', 'fabric sa')
      }
    }
    return part
  },
}
