import { pluginBundle } from '@freesewing/plugin-bundle'

export const pocket = {
  name: 'watchpocket.pocket',
  options: {
    //Constants
    useVoidStores: true,
    // cpFraction: 0.55191502449,
    //Pocket
    watchPocketWidth: { pct: 0, min: -50, max: 200, menu: 'pockets.watchPockets' },
    watchPocketDepth: { pct: 0, min: -50, max: 200, menu: 'pockets.watchPockets' },
    watchPocketCurveDepth: {
      pct: (1 / 3) * 100,
      min: 0,
      max: (2 / 3) * 100,
      menu: 'pockets.watchPockets',
    },
    watchPocketCurveCpDepth: { pct: 50, min: 0, max: 100, menu: 'pockets.watchPockets' },
    watchPocketCurveCpWidth: { pct: 75, min: 0, max: 100, menu: 'pockets.watchPockets' },
    //Construction
    watchPocketSaTopWidth: { pct: 2, min: 1, max: 3, menu: 'construction' },
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
      void store.setIfUnset('watchPocketWidth', 76.2 * (1 + options.watchPocketWidth))
      void store.setIfUnset('watchPocketDepth', 63.5 * (1 + options.watchPocketDepth))
    }

    let width = store.get('watchPocketWidth')
    let depth = store.get('watchPocketDepth')

    //let's begin
    points.topMid = new Point(0, 0)
    points.topLeft = points.topMid.shift(180, width / 2)
    points.topRight = points.topLeft.flipX(points.topMid)
    points.bottomMid = points.topMid.shift(-90, depth)
    points.bottomLeft = new Point(points.topLeft.x, points.bottomMid.y)
    points.bottomRight = points.bottomLeft.flipX(points.bottomMid)
    points.curveStart = points.topLeft.shiftFractionTowards(
      points.bottomLeft,
      options.watchPocketCurveDepth
    )
    points.curveEnd = points.curveStart.flipX(points.bottomMid)
    points.curveCp1 = points.curveStart.shiftFractionTowards(
      points.bottomLeft,
      options.watchPocketCurveCpDepth
    )
    points.curveCp2 = points.bottomMid.shiftFractionTowards(
      points.bottomLeft,
      options.watchPocketCurveCpWidth
    )
    points.curveCp3 = points.curveCp2.flipX(points.bottomMid)
    points.curveCp4 = points.curveCp1.flipX(points.bottomMid)
    //paths
    paths.saTop = new Path().move(points.topRight).line(points.topLeft).hide()

    paths.saBase = new Path()
      .move(points.topLeft)
      .line(points.curveStart)
      .curve(points.curveCp1, points.curveCp2, points.bottomMid)
      .curve(points.curveCp3, points.curveCp4, points.curveEnd)
      .line(points.topRight)
      .hide()

    paths.seam = paths.saTop.clone().join(paths.saBase).close()
    if (complete) {
      //grainline
      points.grainlineFrom = points.topMid
      points.grainlineTo = points.bottomMid
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //title
      points.title = new Point(points.topRight.x / 3, points.bottomLeft.y / 3)
      macro('title', {
        at: points.title,
        nr: '1',
        title: 'Watch Pocket',
        scale: 0.25,
      })
      if (sa) {
        paths.sa = paths.saTop
          .offset(sa * options.watchPocketSaTopWidth * 100)
          .join(paths.saBase.offset(sa))
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
