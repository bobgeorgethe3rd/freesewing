import { front } from './front.mjs'
import { pctBasedOn } from '@freesewing/core'

export const belt = {
  name: 'shannon.belt',
  after: front,
  options: {
    //Style
    belt: { bool: true, menu: 'style' },
    beltLength: { pct: 57.5, min: 0, max: 200, menu: 'style' },
    beltWidth: {
      pct: 10.2,
      min: 5,
      max: 20,
      snap: 5,
      ...pctBasedOn('hpsToWaistBack'),
      menu: 'style',
    },
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
    //render
    if (!options.belt) {
      part.hide()
      return part
    }
    //measures
    const beltLength = measurements.waist * (1 + options.waistEase) * (1 + options.beltLength)
    //let's begin
    points.topMid = new Point(0, 0)
    points.topLeft = points.topMid.shift(180, beltLength / 2)
    points.topRight = points.topLeft.flipX(points.topMid)
    points.bottomMid = points.topMid.shift(-90, absoluteOptions.beltWidth)
    points.bottomLeft = new Point(points.topLeft.x, points.bottomMid.y)
    points.bottomRight = points.bottomLeft.flipX(points.bottomMid)
    //paths
    paths.seam = new Path()
      .move(points.topLeft)
      .line(points.bottomLeft)
      .line(points.bottomRight)
      .line(points.topRight)
      .line(points.topLeft)
      .close()

    //stores
    store.set('beltWidth', absoluteOptions.beltWidth)

    if (complete) {
      //grainline
      points.grainlineFrom = new Point(points.topLeft.x / 3, points.topMid.y)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.bottomMid.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      macro('sprinkle', {
        snippet: 'notch',
        on: ['topRight', 'bottomRight'],
      })
      //title
      points.title = new Point(points.topRight.x / 3, points.bottomRight.y / 2)
      macro('title', {
        at: points.title,
        nr: '6',
        title: 'Belt',
        cutNr: 4,
        scale: 0.25,
      })
      if (sa) {
        points.saTopLeft = points.topLeft.translate(-sa, -sa)
        points.saBottomLeft = points.bottomLeft.translate(-sa, sa)
        points.saTopRight = points.saTopLeft.flipX(points.topMid)
        points.saBottomRight = points.saBottomLeft.flipX(points.topMid)

        paths.sa = new Path()
          .move(points.saTopLeft)
          .line(points.saBottomLeft)
          .line(points.saBottomRight)
          .line(points.saTopRight)
          .line(points.saTopLeft)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
