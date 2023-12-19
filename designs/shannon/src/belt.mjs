import { front } from './front.mjs'
import { pctBasedOn } from '@freesewing/core'

export const belt = {
  name: 'shannon.belt',
  after: front,
  options: {
    //Style
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
  draft: (sh) => {
    const {
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
      absoluteOptions,
      snippets,
      Snippet,
    } = sh
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

    if (complete) {
      //grainline
      points.grainlineFrom = points.topLeft.shiftFractionTowards(points.topMid, 0.5)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.bottomMid.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //title
      points.title = new Point(points.topRight.x / 2, points.bottomRight.y / 2)
      macro('title', {
        at: points.title,
        nr: '6',
        title: 'Belt',
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
