import { pluginBundle } from '@freesewing/plugin-bundle'

export const pocket = {
  name: 'pearpocket.pocket',
  options: {
    //Constants
    useVoidStores: true,
    pocketOpening: 0.064,
    scalePockets: true,
    //Pockets
    pearPocketTopWidth: { pct: (1 / 6) * 100, min: 15, max: 20, menu: 'pockets.pearPockets' },
    pearPocketWidth: { pct: (2 / 3) * 100, min: 60, max: 85, menu: 'pockets.pearPockets' },
    pearPocketDepth: { pct: 32.5, min: 25, max: 40, menu: 'pockets.pearPockets' },
    pearPocketToAnchor: { pct: (2 / 3) * 100, min: 30, max: 75, menu: 'pockets.pearPockets' },
    pearPocketCurvePlacement: { pct: 53.9, min: 40, max: 60, menu: 'pockets.pearPockets' },
    //Construction
    pocketBagSaWidth: { pct: 2, min: 1, max: 3, menu: 'construction' },
    //Advanced
  },
  plugins: [pluginBundle],
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
    //measures
    if (options.useVoidStores) {
      void store.setIfUnset('anchorSeamLength', 304.8)
      void store.setIfUnset('insertSeamLength', 1016)
    }
    void store.setIfUnset('waistbandWidth', 0)

    const pocketOpening = store.get('insertSeamLength') * options.pocketOpening
    const depthTop = pocketOpening * options.pearPocketToAnchor

    let width
    let depth
    let widthTop
    if (!options.scalePockets) {
      width = 203.2
      depth = 304.8
      widthTop = 5.08
    } else {
      width = store.get('anchorSeamLength') * options.pearPocketWidth
      depth = store.get('insertSeamLength') * options.pearPocketDepth
      widthTop = store.get('anchorSeamLength') * options.pearPocketTopWidth
    }
    //let's begin
    points.slitTop = new Point(0, 0)
    points.topMid = points.slitTop.shift(90, depthTop)
    points.topLeft = points.topMid.shift(180, widthTop / 2)
    points.topRight = points.topLeft.flipX(points.topMid)
    points.bottomMid = points.slitTop.shift(-90, depth)
    points.curveMid = points.slitTop.shiftFractionTowards(
      points.bottomMid,
      options.pearPocketCurvePlacement
    )
    points.curveLeft = points.curveMid.shift(180, width / 2)
    points.curveRight = points.curveLeft.flipX(points.curveMid)

    points.curveLeftCp2 = points.curveLeft.shiftFractionTowards(
      new Point(points.curveLeft.x, points.slitTop.y),
      1 / 3
    )
    points.curveLeftCp1 = points.topLeft.shiftFractionTowards(points.curveLeftCp2, 0.75)
    points.curveLeftCp3 = new Point(points.curveLeft.x, points.bottomMid.y)
    points.curveLeftCp4 = points.bottomMid.shiftFractionTowards(points.curveLeftCp3, 0.05)

    points.curveRightCp1 = points.curveLeftCp4.flipX(points.bottomMid)
    points.curveRightCp2 = points.curveLeftCp3.flipX(points.bottomMid)
    points.curveRightCp3 = points.curveLeftCp2.flipX(points.bottomMid)
    points.curveRightCp4 = points.curveLeftCp1.flipX(points.bottomMid)

    //paths
    paths.seam = new Path()
      .move(points.bottomMid)
      .curve(points.curveRightCp1, points.curveRightCp2, points.curveRight)
      .curve(points.curveRightCp3, points.curveRightCp4, points.topRight)
      .line(points.topLeft)
      .curve(points.curveLeftCp1, points.curveLeftCp2, points.curveLeft)
      .curve(points.curveLeftCp3, points.curveLeftCp4, points.bottomMid)
      .close()

    //stores
    points.slitBottom = points.curveMid.shiftFractionTowards(points.slitTop, 1 / 7)
    store.set('pocketOpening', pocketOpening)

    if (complete) {
      //grainline
      points.grainlineFrom = points.curveMid
      points.grainlineTo = points.bottomMid
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      macro('sprinkle', {
        snippet: 'notch',
        on: ['slitTop', 'slitBottom'],
      })
      //title
      points.title = points.curveMid.shiftFractionTowards(points.curveRight, 0.15)
      macro('title', {
        at: points.title,
        nr: 1,
        title: 'Pear Shaped Pocket',
        scale: 0.75,
      })
      //opening
      paths.opening = new Path()
        .move(points.slitTop)
        .line(points.slitBottom)
        .attr('class', 'various')
        .attr('data-text', 'Slit Opening')
        .attr('data-text-class', 'center')
      if (sa) {
        paths.sa = paths.seam
          .offset(sa * options.pocketBagSaWidth * 100)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
