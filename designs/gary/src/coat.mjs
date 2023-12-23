import { feet } from './feet.mjs'

export const coat = {
  name: 'gary.coat',
  after: feet,
  draft: ({ Point, points, Path, paths, options, paperless, macro, sa, store, part }) => {
    //measures
    const coatWidth = 172 * options.scale
    //let's begin
    points.topLeft = new Point(0, 0)
    points.bottomLeft = points.topLeft.shift(-90, 136 * options.scale)
    points.topRight = points.topLeft.shift(0, coatWidth)
    points.bottomRight = new Point(points.topRight.x, points.bottomLeft.y)
    //paths
    paths.saBase = new Path()
      .move(points.bottomLeft)
      .line(points.bottomRight)
      .line(points.topRight)
      .line(points.topLeft)
      .hide()

    paths.seam = paths.saBase.clone().line(points.bottomLeft).close().unhide()

    //stores
    store.set('coatWidth', coatWidth)

    //details
    //grainline
    points.cutOnFoldFrom = points.topLeft
    points.cutOnFoldTo = points.bottomLeft
    macro('cutonfold', {
      from: points.cutOnFoldFrom,
      to: points.cutOnFoldTo,
      grainline: true,
    })
    //notches
    macro('sprinkle', {
      snippet: 'notch',
      on: ['topLeft', 'bottomLeft'],
    })
    //title
    points.title = new Point(points.bottomRight.x / 3, points.bottomRight.y / 2)
    macro('title', {
      at: points.title,
      nr: '5',
      title: 'coat',
      scale: 0.5 * options.scale,
    })
    if (sa) {
      paths.sa = paths.saBase.offset(sa).line(points.bottomLeft).close().attr('class', 'fabric sa')
    }

    return part
  },
}
