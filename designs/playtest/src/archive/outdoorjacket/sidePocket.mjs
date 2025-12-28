import { frontBase } from './frontBase.mjs'

export const sidePocket = {
  name: 'playtest.sidePocket',
  after: frontBase,
  hide: {
    after: true,
  },
  options: {
    //Pockets
    sidePocketTopDepth: { pct: 13, min: 0, max: 20, menu: 'pockets.sidePockets' },
    sidePocketFacingWidth: { pct: 25, min: 10, max: 50, menu: 'pockets.sidePockets' },
  },
  draft: ({
    options,
    Point,
    Path,
    points,
    paths,
    Snippet,
    snippets,
    utils,
    complete,
    store,
    sa,
    measurements,
    absoluteOptions,
    paperless,
    macro,
    part,
  }) => {
    //set Render
    const sidePocketOpeningWidth = store.get('sidePocketOpeningWidth')
    if (
      !options.sidePocketsBool ||
      store.get('sidePocketOpeningDepth') + sidePocketOpeningWidth > store.get('sidePocketMaxDepth')
    ) {
      part.hide()
      return part
    }
    //measuresments
    const sidePocketTopDepth = sidePocketOpeningWidth * options.sidePocketTopDepth
    const sidePocketDepth =
      sidePocketOpeningWidth + sidePocketTopDepth + store.get('sidePocketDepth')
    //let's begin
    points.origin = new Point(0, 0)
    points.bottomRight = points.origin.translate(
      store.get('sidePocketWidth') * 0.5,
      sidePocketDepth * 0.5
    )
    points.topRight = points.bottomRight.flipY(points.origin)
    points.topLeft = points.topRight.flipX(points.origin)
    points.bottomLeft = points.topLeft.flipY(points.origin)

    //paths
    paths.seam = new Path()
      .move(points.topRight)
      .line(points.topLeft)
      .line(points.bottomLeft)
      .line(points.bottomRight)
      .line(points.topRight)
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
      points.openingTop = points.topRight.shift(-90, sidePocketTopDepth)
      points.openingBottom = points.openingTop.shift(-90, sidePocketOpeningWidth)
      macro('sprinkle', {
        snippet: 'bnotch',
        on: ['openingTop', 'openingBottom'],
      })
      //title
      points.title = points.origin
      macro('title', {
        at: points.title,
        nr: '4',
        title: 'Side Pocket',
        cutNr: 4,
        scale: 0.5,
      })
      //facing
      points.facingTop = points.topRight.shiftFractionTowards(
        points.topLeft,
        options.sidePocketFacingWidth
      )
      points.facingBottom = new Point(points.facingTop.x, points.bottomLeft.y)
      paths.facingLine = new Path()
        .move(points.facingTop)
        .line(points.facingBottom)
        .attr('class', 'mark')
        .attr('data-text', 'Facing Line')
        .attr('data-text-class', 'center')
      if (sa) {
        points.saBottomRight = points.bottomRight.translate(sa * options.sideSeamSaWidth * 100, sa)
        points.saTopRight = points.saBottomRight.flipY(points.origin)
        points.saTopLeft = points.topLeft.translate(-sa, -sa)
        points.saBottomLeft = points.saTopLeft.flipY(points.origin)

        points.saOpeningTop = new Point(points.saTopRight.x, points.openingTop.y)
        points.saOpeningBottom = new Point(points.saTopRight.x, points.openingBottom.y)

        paths.stitchingLine = new Path()
          .move(points.saOpeningTop)
          .line(points.openingTop)
          .line(points.openingBottom)
          .line(points.saOpeningBottom)
          .attr('class', 'mark lashed')
          .attr('data-text', 'Side Pocket Stitching Line')
          .attr('data-text-class', 'center')

        paths.sa = new Path()
          .move(points.saBottomRight)
          .line(points.saTopRight)
          .line(points.saTopLeft)
          .line(points.saBottomLeft)
          .line(points.saBottomRight)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
