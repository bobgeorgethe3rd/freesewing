import { coat } from './coat.mjs'

export const coatTrim = {
  name: 'gary.coatTrim',
  after: coat,
  draft: ({ Point, points, Path, paths, options, paperless, macro, sa, store, part }) => {
    //let's begin
    points.topLeft = new Point(0, 0)
    points.bottomLeft = points.topLeft.shift(-90, 50 * options.scale)
    points.topRight = points.topLeft.shift(0, store.get('coatWidth') * 2)
    points.bottomRight = new Point(points.topRight.x, points.bottomLeft.y)

    paths.seam = new Path()
      .move(points.topLeft)
      .line(points.bottomLeft)
      .line(points.bottomRight)
      .line(points.topRight)
      .line(points.topLeft)
      .close()

    //details
    //grainline
    points.grainlineFrom = points.topLeft.shiftFractionTowards(points.topRight, 0.5)
    points.grainlineTo = new Point(points.grainlineFrom.x, points.bottomLeft.y)
    macro('grainline', {
      from: points.grainlineFrom,
      to: points.grainlineTo,
    })
    //notches
    points.topMid = points.topLeft.shiftFractionTowards(points.topRight, 0.5)
    points.bottomMid = new Point(points.topMid.x, points.bottomLeft.y)
    macro('sprinkle', {
      snippet: 'notch',
      on: ['topMid', 'bottomMid'],
    })
    //title
    points.title = new Point((points.bottomRight.x * 2) / 3, points.bottomRight.y / 2)
    macro('title', {
      at: points.title,
      nr: '9',
      title: 'coatTrim',
      scale: 0.25 * options.scale,
    })
    if (sa) {
      paths.sa = new Path()
        .move(points.topLeft.shift(180, sa))
        .line(points.bottomLeft.shift(180, sa))
        .line(points.bottomRight.shift(0, sa))
        .line(points.topRight.shift(0, sa))
        .close()
        .attr('class', 'fabric sa')
    }
    return part
  },
}
