import { feet } from './feet.mjs'

export const beard = {
  name: 'gary.beard',
  after: feet,
  draft: ({
    Point,
    points,
    Path,
    paths,
    options,
    paperless,
    macro,
    sa,
    part,
    snippets,
    Snippet,
  }) => {
    //measures
    const beardLength = 108 * options.scale
    //let's begin
    points.topMid = new Point(0, 0)
    points.topLeft = points.topMid.shift(180, 43 * options.scale)
    points.topRight = points.topLeft.flipX()
    points.bottom = points.topMid.shift(-90, beardLength)
    points.topLeftCp2 = points.topLeft.shift(-90, (beardLength * (Math.PI - 2)) / 3)
    points.bottomCp1 = points.bottom.shift(135, beardLength / 3 / Math.cos(Math.PI / 4))
    points.bottomCp2 = points.bottomCp1.flipX()
    points.topRightCp1 = points.topLeftCp2.flipX()
    //paths
    paths.hemBase = new Path().move(points.topRight).line(points.topLeft).hide()

    paths.saBase = new Path()
      .move(points.topLeft)
      .curve(points.topLeftCp2, points.bottomCp1, points.bottom)
      .curve(points.bottomCp2, points.topRightCp1, points.topRight)
      .hide()

    paths.seam = paths.hemBase.clone().join(paths.saBase).close()

    //details
    //grainline
    points.grainlineFrom = points.topMid
    points.grainlineTo = points.bottom
    macro('grainline', {
      from: points.grainlineFrom,
      to: points.grainlineTo,
    })
    //notches
    snippets.notch = new Snippet('notch', points.topMid)
    //title
    points.title = new Point(points.topRight.x / 4, points.bottom.y / 4)
    macro('title', {
      at: points.title,
      nr: '4',
      title: 'beard',
      scale: 0.25 * options.scale,
    })
    //banner
    macro('banner', {
      path: paths.saBase.unhide(),
      text: 'doNotAddSeamAllowance',
    })
    if (sa) {
      paths.sa = paths.hemBase.offset(sa).join(paths.saBase).close().attr('class', 'fabric sa')
    }

    return part
  },
}
