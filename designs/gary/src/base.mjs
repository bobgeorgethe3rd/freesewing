import { body } from './body.mjs'

export const base = {
  name: 'gary.base',
  after: body,
  options: {
    cpFraction: 0.55191502449,
  },
  draft: ({ store, sa, Point, points, Path, paths, options, paperless, macro, part }) => {
    //let's begin
    points.origin = new Point(0, 0)
    points.top = points.origin.shift(90, 64 * options.scale)

    let tweak = 1
    let delta
    do {
      points.left = points.origin.shift(180, points.origin.dist(points.top) * tweak)
      points.topCp2 = points.top.shift(180, points.origin.dist(points.left) * options.cpFraction)
      points.leftCp1 = points.left.shift(90, points.origin.dist(points.top) * options.cpFraction)
      paths.curve = new Path()
        .move(points.top)
        .curve(points.topCp2, points.leftCp1, points.left)
        .hide()
      delta = paths.curve.length() - store.get('bodyWidth') / 2
      if (delta > 0) tweak = tweak * 0.99
      else tweak = tweak * 1.01
    } while (Math.abs(delta) > 0.01)

    points.bottom = points.top.flipY()
    points.leftCp2 = points.leftCp1.flipY()
    points.bottomCp1 = points.topCp2.flipY()

    paths.seamBase = paths.curve.curve(points.leftCp2, points.bottomCp1, points.bottom).hide()

    macro('mirror', {
      mirror: [points.top, points.bottom],
      paths: ['seamBase'],
      prefix: 'm',
    })

    paths.seam = paths.seamBase.join(paths.mSeamBase.reverse()).close()

    //details
    //grainline
    points.grainlineFrom = points.top
    points.grainlineTo = points.bottom
    macro('grainline', {
      from: points.grainlineFrom,
      to: points.grainlineTo,
    })
    //notches
    points.right = points.left.flipX()
    macro('sprinkle', {
      snippet: 'notch',
      on: ['top', 'left', 'bottom', 'right'],
    })
    //title
    points.title = new Point(points.left.x / 4, points.origin.y).flipX()
    macro('title', {
      at: points.title,
      nr: '3',
      title: 'base',
      scale: 0.5 * options.scale,
    })
    if (sa) {
      paths.sa = paths.seam.offset(sa).close().attr('class', 'fabric sa')
    }

    return part
  },
}
