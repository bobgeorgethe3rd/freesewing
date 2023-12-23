import { util } from 'chai'
import { feet } from './feet.mjs'

export const body = {
  name: 'gary.body',
  after: feet,
  draft: ({ store, sa, Point, points, Path, paths, options, utils, paperless, macro, part }) => {
    //measures
    const bodyWidth = 210 * options.scale
    const bodyLength = 335 * options.scale
    //let's begin
    points.bottom = new Point(0, 0)
    points.top = points.bottom.shift(90, bodyLength)
    points.bottomLeft = points.bottom.shift(180, bodyWidth / 2)
    points.topCp2 = points.top.shift(240, bodyLength / 2 / Math.cos(Math.PI / 6))
    points.bottomLeftCp1 = points.bottomLeft.shift(90, (bodyLength * (Math.PI - 2)) / 4)
    points.bottomRight = points.bottomLeft.flipX()
    points.bottomRightCp2 = points.bottomLeftCp1.flipX()
    points.topCp1 = points.topCp2.flipX()

    paths.seam = new Path()
      .move(points.bottomLeft)
      .line(points.bottomRight)
      .curve(points.bottomRightCp2, points.topCp1, points.top)
      .curve(points.topCp2, points.bottomLeftCp1, points.bottomLeft)
      .close()
    //stores
    store.set('bodyWidth', bodyWidth)
    //details
    //grainline
    points.grainlineFrom = points.top
    points.grainlineTo = points.bottom
    macro('grainline', {
      from: points.grainlineFrom,
      to: points.grainlineTo,
    })
    //notches
    points.feetLeft1 = points.bottomLeft.shift(0, 90 * options.scale)
    points.feetLeft0 = points.feetLeft1.shift(180, store.get('feetWidth'))
    points.feetRight0 = points.feetLeft1.flipX()
    points.feetRight1 = points.feetLeft0.flipX()
    macro('sprinkle', {
      snippet: 'notch',
      on: ['feetLeft0', 'feetLeft1', 'feetRight0', 'feetRight1'],
    })
    //title
    points.title = new Point(points.bottomRight.x / 4, points.top.y / 3)
    macro('title', {
      at: points.title,
      nr: '2',
      title: 'body',
      scale: 0.5 * options.scale,
    })
    //placement
    points.placemnetLeft = utils.curveIntersectsY(
      points.top,
      points.topCp2,
      points.bottomLeftCp1,
      points.bottomLeft,
      points.bottom.y - 154 * options.scale
    )
    points.placemnetRight = points.placemnetLeft.flipX()
    paths.placement = new Path()
      .move(points.placemnetLeft)
      .line(points.placemnetRight)
      .attr('class', 'various help')
      .attr('data-text', 'placementLine')
      .attr('data-text-class', 'center')
    if (sa) {
      paths.sa = paths.seam.offset(sa).close().attr('class', 'fabric sa')
    }

    return part
  },
}
