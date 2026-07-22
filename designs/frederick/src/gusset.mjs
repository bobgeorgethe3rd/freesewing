import { body } from './body.mjs'

export const gusset = {
  name: 'frederick.gusset',
  after: body,
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
    //measures
    const gussetWidth = store.get('gussetWidth')
    //let's begin
    points.origin = new Point(0, 0)

    points.topLeft = points.origin.translate(gussetWidth * -0.5, gussetWidth * -0.5)
    points.bottomLeft = points.topLeft.flipY(points.origin)
    points.bottomRight = points.bottomLeft.flipX(points.origin)
    points.topRight = points.bottomRight.flipY(points.origin)

    //paths
    paths.seam = new Path()
      .move(points.topLeft)
      .line(points.bottomLeft)
      .line(points.bottomRight)
      .line(points.topRight)
      .line(points.topLeft)
      .close()

    if (complete) {
      //grainline
      points.grainlineFrom = new Point(points.topLeft.x * 0.5, points.topLeft.y)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.bottomLeft.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      macro('sprinkle', {
        snippet: 'notch',
        on: ['topLeft', 'bottomLeft', 'bottomRight', 'topRight'],
      })
      //title
      points.title = points.origin
      macro('title', {
        at: points.title,
        nr: 4,
        title: 'Gusset',
        cutNr: 2,
        scale: 0.5,
      })
      if (sa) {
        const sideSeamSa = sa * options.sideSeamSaWidth * 100

        points.saTopLeft = points.origin.translate(
          gussetWidth * -0.5 - sideSeamSa,
          gussetWidth * -0.5 - sideSeamSa
        )
        points.saBottomLeft = points.saTopLeft.flipY(points.origin)
        points.saBottomRight = points.saBottomLeft.flipX(points.origin)
        points.saTopRight = points.saBottomRight.flipY(points.origin)

        //paths
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
