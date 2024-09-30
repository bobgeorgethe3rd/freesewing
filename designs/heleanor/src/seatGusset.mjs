import { leg } from './leg.mjs'
export const seatGusset = {
  name: 'heleanor.seatGusset',
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
    log,
  }) => {
    //measurements
    const seatGussetWidth = store.get('seatGussetWidth')
    const seatGussetTopWidth = store.get('seatGussetTopWidth')
    const crotchGussetWidth = store.get('crotchGussetWidth')
    //let's begin
    points.origin = new Point(0, 0)
    points.bottomRight = points.origin.shift(0, seatGussetWidth + crotchGussetWidth / 2)
    points.topRight = points.bottomRight.translate(
      (points.bottomRight.x - store.get('seatGussetTopWidth') * 0.5) * -1,
      -Math.sqrt(
        Math.pow(store.get('seatGussetLength'), 2) -
          Math.pow(seatGussetWidth + crotchGussetWidth / 2 - seatGussetTopWidth / 2, 2)
      )
    )
    points.topLeft = points.topRight.flipX()
    points.bottomLeft = points.bottomRight.flipX()

    //paths
    paths.seam = new Path()
      .move(points.bottomLeft)
      .line(points.bottomRight)
      .line(points.topRight)
      .line(points.topLeft)
      .line(points.bottomLeft)
      .close()

    if (complete) {
      //grainline
      points.grainlineFrom = points.topLeft.shiftFractionTowards(points.topRight, 0.1)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.bottomLeft.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      points.topNotch = new Point(points.origin.x, points.topLeft.y)
      snippets.topNotch = new Snippet('notch', points.topNotch)
      snippets.origin = new Snippet('bnotch', points.origin)
      //title
      points.title = new Point(points.origin.x, points.topLeft.y / 2)
      macro('title', {
        at: points.title,
        nr: '3',
        title: 'Seat Gusset',
        cutNr: 1,
        scale: 0.25,
      })
      if (sa) {
        const crossSeamSa = sa * options.crossSeamSaWidth * 100

        points.saBottomRight = utils.beamIntersectsY(
          points.bottomRight
            .shiftTowards(points.topRight, crossSeamSa)
            .rotate(-90, points.bottomRight),
          points.topRight.shiftTowards(points.bottomRight, crossSeamSa).rotate(90, points.topRight),
          points.bottomLeft.y + crossSeamSa
        )
        points.saTopRight = utils.beamIntersectsY(
          points.bottomRight
            .shiftTowards(points.topRight, crossSeamSa)
            .rotate(-90, points.bottomRight),
          points.topRight.shiftTowards(points.bottomRight, crossSeamSa).rotate(90, points.topRight),
          points.topLeft.y - sa
        )
        points.saTopLeft = points.saTopRight.flipX()
        points.saBottomLeft = points.saBottomRight.flipX()

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
