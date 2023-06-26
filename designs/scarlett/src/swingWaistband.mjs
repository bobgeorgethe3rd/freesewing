import { swingPanel } from './swingPanel.mjs'

export const swingWaistband = {
  name: 'scarlett.swingWaistband',
  after: swingPanel,
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
  }) => {
    //Set Render
    if (
      options.waistbandStyle == 'none' ||
      options.swingPanelStyle == 'none' ||
      (options.closurePosition != 'front' && options.swingPanelStyle != 'separate')
    ) {
      part.hide()
      return part
    }
    //measures
    const length = store.get('swingWaisbandLength') * 2

    let widthMultiplier
    if (options.waistbandFolded) {
      widthMultiplier = 2
    } else widthMultiplier = 1

    const width = store.get('waistbandWidth') * widthMultiplier
    const widthHalf = width / widthMultiplier / 2

    //begin
    points.bottomMid = new Point(0, 0)
    points.topMid = points.bottomMid.shift(90, width)
    points.bottomLeft = points.bottomMid.shift(180, length / 2)
    points.bottomRight = points.bottomLeft.flipX(points.bottomMid)
    points.topLeft = new Point(points.bottomLeft.x, points.topMid.y)
    points.topRight = points.topLeft.flipX(points.topMid)

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
      points.grainlineFrom = points.topLeft.shiftFractionTowards(points.topMid, 0.5)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.bottomMid.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      macro('sprinkle', {
        snippet: 'notch',
        on: ['bottomMid', 'topMid'],
      })
      //title
      points.title = points.topLeft.shiftFractionTowards(points.topMid, 2 / 3).shift(-90, widthHalf)
      macro('title', {
        at: points.title,
        nr: 11,
        title: 'Swing  Waistband',
        scale: 1 / 3,
      })
      //paths
      paths.centreFront = new Path()
        .move(points.topMid)
        .line(points.bottomMid)
        .attr('class', 'various')
        .attr('data-text', 'Centre Front')
        .attr('data-text-class', 'center')

      //buttonholes
      points.flipAnchor = points.bottomMid.shiftFractionTowards(points.topMid, 0.5)
      points.buttonhole0 = points.bottomLeft.translate(widthHalf, -widthHalf)
      points.buttonhole1 = points.buttonhole0.flipX(points.bottomMid)
      macro('sprinkle', {
        snippet: 'buttonhole',
        on: ['buttonhole0', 'buttonhole1'],
        rotate: 90,
      })
      if (options.waistbandFolded) {
        points.buttonhole0F = points.buttonhole0.flipY(points.flipAnchor)
        points.buttonhole1F = points.buttonhole1.flipY(points.flipAnchor)
        macro('sprinkle', {
          snippet: 'buttonhole',
          on: ['buttonhole0F', 'buttonhole1F'],
          rotate: 90,
        })

        paths.foldline = new Path()
          .move(new Point(points.topLeft.x, points.topLeft.y / 2))
          .line(new Point(points.topRight.x, points.topRight.y / 2))
          .attr('class', 'interfacing')
          .attr('data-text', 'Fold - Line')
      }

      if (sa) {
        paths.sa = paths.seam.offset(sa).close().attr('class', 'fabric sa')
      }
    }

    return part
  },
}
