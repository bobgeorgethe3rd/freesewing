import { leg } from './leg.mjs'

export const beltLoop = {
  name: 'francis.beltLoop',
  after: [leg],
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
  }) => {
    if (!options.beltLoops) {
      part.hide()
      return part
    }
    //measurements
    const beltLoopWidth = absoluteOptions.waistbandWidth
    const beltLoopLength = (store.get('waistbandLength') - store.get('panelWidth') * 4) * 0.25

    //let's begin
    points.origin = new Point(0, 0)
    points.bottomRight = new Point(beltLoopLength / 2, beltLoopWidth / 2)
    points.topRight = points.bottomRight.flipY()
    points.topLeft = points.topRight.flipX()
    points.bottomLeft = points.bottomRight.flipX()

    paths.seam = new Path()
      .move(points.topLeft)
      .line(points.bottomLeft)
      .line(points.bottomRight)
      .line(points.topRight)
      .line(points.topLeft)
      .close()

    if (complete) {
      //grainline
      points.grainlineFrom = points.topLeft.shiftFractionTowards(points.topRight, 0.25)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.bottomLeft.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //title
      points.title = new Point(points.topRight.x / 2, points.origin.y)
      macro('title', {
        at: points.title,
        nr: '5',
        title: 'Belt Loop',
        scale: 0.25,
      })
      if (sa) {
        points.saBottomRight = points.bottomRight.translate(sa, sa)
        points.saTopRight = points.saBottomRight.flipY()
        points.saTopLeft = points.saTopRight.flipX()
        points.saBottomLeft = points.saTopLeft.flipY()

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
