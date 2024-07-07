import { seatGusset } from './seatGusset.mjs'
import { waistband } from './waistband.mjs'
export const placket = {
  name: 'heleanor.placket',
  from: [seatGusset],
  after: [waistband],
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
    //set render
    if (!options.fitWaist && !options.waistbandPlacket) {
      part.hide()
      return part
    }
    //removing paths && snippets
    for (let i in paths) delete paths[i]
    for (let i in snippets) delete snippets[i]
    //measurements
    const placketWidth = store.get('waistbandPlacketWidth')
    //let's begin
    points.bottomRight = points.bottomLeft.shiftTowards(points.bottomRight, placketWidth)
    points.topRight = points.topLeft.shiftTowards(points.topRight, placketWidth)

    paths.seam = new Path()
      .move(points.bottomLeft)
      .line(points.bottomRight)
      .line(points.topRight)
      .line(points.topLeft)
      .line(points.bottomLeft)
      .close()

    if (complete) {
      //grainline
      points.grainlineFrom = new Point(points.topLeft.x, points.topLeft.y * 0.8)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.bottomLeft.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //title
      points.title = new Point(points.topLeft.x * 0.9, points.topLeft.y * 0.9)
      macro('title', {
        at: points.title,
        nr: '7',
        title: 'Placket',
        scale: 0.25,
      })
      if (sa) {
        points.saBottomRight = utils.beamIntersectsY(
          points.bottomRight.shiftTowards(points.topRight, sa).rotate(-90, points.bottomRight),
          points.topRight.shiftTowards(points.bottomRight, sa).rotate(90, points.topRight),
          points.bottomLeft.y + sa
        )
        points.saTopRight = utils.beamIntersectsY(
          points.bottomRight.shiftTowards(points.topRight, sa).rotate(-90, points.bottomRight),
          points.topRight.shiftTowards(points.bottomRight, sa).rotate(90, points.topRight),
          points.topLeft.y - sa
        )

        paths.sa = new Path()
          .move(points.saBottomLeft)
          .line(points.saBottomRight)
          .line(points.saTopRight)
          .line(points.saTopLeft)
          .line(points.saBottomLeft)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
