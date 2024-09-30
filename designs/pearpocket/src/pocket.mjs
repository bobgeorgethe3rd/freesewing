import { pluginBundle } from '@freesewing/plugin-bundle'

export const pocket = {
  name: 'pearpocket.pocket',
  options: {
    //Constants
    useVoidStores: true,
    scalePockets: true,
    //Pockets
    pocketOpening: { pct: 6.4, min: 5, max: 15, menu: 'pockets' },
    pocketOpeningLength: { pct: 85.8, min: 40, max: 100, menu: 'pockets' },
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

    points.curveLeftCp1 = points.curveLeft.shiftFractionTowards(
      new Point(points.curveLeft.x, points.slitTop.y),
      1 / 3
    )
    points.topLeftCp2 = points.topLeft.shiftFractionTowards(points.curveLeftCp1, 0.75)
    points.curveLeftCp2 = new Point(points.curveLeft.x, points.bottomMid.y)
    points.bottomMidCp1 = points.bottomMid.shiftFractionTowards(points.curveLeftCp2, 0.05)

    points.bottomMidCp2 = points.bottomMidCp1.flipX(points.bottomMid)
    points.curveRightCp1 = points.curveLeftCp2.flipX(points.bottomMid)
    points.curveRightCp2 = points.curveLeftCp1.flipX(points.bottomMid)
    points.topRightCp1 = points.topLeftCp2.flipX(points.bottomMid)

    //paths
    paths.saBase = new Path()
      .move(points.topLeft)
      .curve(points.topLeftCp2, points.curveLeftCp1, points.curveLeft)
      .curve(points.curveLeftCp2, points.bottomMidCp1, points.bottomMid)
      .curve(points.bottomMidCp2, points.curveRightCp1, points.curveRight)
      .curve(points.curveRightCp2, points.topRightCp1, points.topRight)
      .hide()

    paths.seam = paths.saBase.clone().line(points.topLeft).close().unhide()

    //stores
    points.slitBottom = points.slitTop.shiftFractionTowards(
      points.curveMid,
      options.pocketOpeningLength
    )
    store.set('pocketOpening', pocketOpening)
    store.set(
      'pocketOpeningLength',
      store.get('pocketOpening') + points.slitTop.dist(points.slitBottom)
    )
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
        cutNr: 4,
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
        const pocketBagSa = sa * options.pocketBagSaWidth * 100
        points.saTopRight = utils.beamIntersectsY(
          points.topRightCp1
            .shiftTowards(points.topRight, pocketBagSa)
            .rotate(-90, points.topRightCp1),
          points.topRight.shiftTowards(points.topRightCp1, pocketBagSa).rotate(90, points.topRight),
          points.topRight.y - pocketBagSa
        )
        points.saTopLeft = points.saTopRight.flipX()
        paths.sa = paths.saBase
          .offset(pocketBagSa)
          .line(points.saTopRight)
          .line(points.saTopLeft)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
