import { box } from './box.mjs'

export const facing = {
  name: 'playtest.facing',
  after: box,
  draft: ({
    store,
    sa,
    Point,
    points,
    Path,
    paths,
    options,
    absoluteOptions,
    complete,
    paperless,
    macro,
    measurements,
    part,
    snippets,
    Snippet,
  }) => {
    //measurements
    const radius = (store.get('innerDiameter') - 12.7) / 6
    const cpDist = radius * options.cpFraction
    //let's begin
    points.origin = new Point(0, 0)
    points.right = points.origin.shift(0, radius)
    points.top = points.origin.shift(90, radius)
    points.left = points.origin.shift(180, radius)
    points.bottom = points.origin.shift(270, radius)

    points.rightCp2 = points.right.shift(90, cpDist)
    points.topCp1 = points.top.shift(0, cpDist)
    points.topCp2 = points.topCp1.flipX(points.origin)
    points.leftCp1 = points.rightCp2.flipX(points.origin)
    points.leftCp2 = points.leftCp1.flipY(points.origin)
    points.bottomCp1 = points.topCp2.flipY(points.origin)
    points.bottomCp2 = points.bottomCp1.flipX(points.origin)
    points.rightCp1 = points.leftCp2.flipX(points.origin)

    //paths
    paths.seam = new Path()
      .move(points.right)
      .curve(points.rightCp2, points.topCp1, points.top)
      .curve(points.topCp2, points.leftCp1, points.left)
      .curve(points.leftCp2, points.bottomCp1, points.bottom)
      .curve(points.bottomCp2, points.rightCp1, points.right)
      .close()

    if (complete) {
      //grainline
      points.grainlineFrom = points.top
      points.grainlineTo = points.bottom
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      macro('sprinkle', {
        snippet: 'notch',
        on: ['top', 'left', 'bottom', 'right', 'origin'],
      })
      //title
      points.title = points.origin.shiftFractionTowards(points.right, 0.15)
      macro('title', {
        at: points.title,
        nr: 'Facing',
        title: 'facing',
        scale: 0.25,
        cutNr: 1,
      })
    }
    return part
  },
}
