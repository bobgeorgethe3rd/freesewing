import { leg } from './leg.mjs'
export const crotchGusset = {
  name: 'heleanor.crotchGusset',
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
    const crotchGussetWidth = store.get('crotchGussetWidth')
    const crotchGussetBottomWidth = store.get('crotchGussetBottomWidth')
    //let's begin
    points.origin = new Point(0, 0)
    points.topRight = points.origin.shift(0, crotchGussetWidth / 2)
    points.bottomRight = points.topRight.translate(
      (crotchGussetWidth - crotchGussetBottomWidth) / -2,
      Math.sqrt(
        Math.pow(store.get('crossSeamLength'), 2) -
          Math.pow((crotchGussetWidth - crotchGussetBottomWidth) / 2, 2)
      )
    )
    points.bottomLeft = points.bottomRight.flipX()
    points.topLeft = points.topRight.flipX()

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
      points.grainlineTo = points.bottomLeft
      points.grainlineFrom = new Point(points.grainlineTo.x, points.topLeft.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      points.rightNotch = points.bottomRight.shiftTowards(
        points.topRight,
        store.get('crotchNotchWidth')
      )
      points.leftNotch = points.rightNotch.flipX()
      points.bottomNotch = new Point(points.origin.x, points.bottomLeft.y)
      snippets.bottomNotch = new Snippet('notch', points.bottomNotch)
      macro('sprinkle', {
        snippet: 'bnotch',
        on: ['leftNotch', 'rightNotch', 'origin'],
      })
      //title
      points.title = new Point(points.origin.x, points.bottomLeft.y / 4)
      macro('title', {
        at: points.title,
        nr: '2',
        title: 'Crotch Gusset',
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
          points.bottomLeft.y + sa
        )
        points.saTopRight = utils.beamIntersectsY(
          points.bottomRight
            .shiftTowards(points.topRight, crossSeamSa)
            .rotate(-90, points.bottomRight),
          points.topRight.shiftTowards(points.bottomRight, crossSeamSa).rotate(90, points.topRight),
          points.topLeft.y - crossSeamSa
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
