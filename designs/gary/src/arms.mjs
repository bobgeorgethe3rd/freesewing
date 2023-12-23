import { feet } from './feet.mjs'

export const arms = {
  name: 'gary.arms',
  after: feet,
  draft: ({ store, sa, Point, points, Path, paths, options, paperless, macro, part }) => {
    //measures
    const armWidth = 72 * options.scale
    //let's begin
    points.topLeft = new Point(0, 0)
    points.topRight = points.topLeft.shift(0, armWidth)
    points.bottomLeft = points.topLeft.shift(-90, 77 * options.scale)
    points.bottomRight = new Point(points.topRight.x, points.bottomLeft.y)
    //paths
    paths.seam = new Path()
      .move(points.topLeft)
      .line(points.bottomLeft)
      .line(points.bottomRight)
      .line(points.topRight)
      .line(points.topLeft)
      .close()
    //stores
    store.set('armWidth', armWidth)
    //details
    points.grainlineFrom = points.topLeft.shiftFractionTowards(points.topRight, 0.5)
    points.grainlineTo = new Point(points.grainlineFrom.x, points.bottomLeft.y)
    macro('grainline', {
      from: points.grainlineFrom,
      to: points.grainlineTo,
    })
    //title
    points.title = new Point((points.topRight.x * 2) / 3, points.bottomRight.y / 2)
    macro('title', {
      at: points.title,
      nr: '6',
      title: 'arm',
      scale: 0.25 * options.scale,
    })
    if (sa) {
      paths.sa = paths.seam.offset(sa).close().attr('class', 'fabric sa')
    }

    return part
  },
}
