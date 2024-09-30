import { pluginBundle } from '@freesewing/plugin-bundle'

export const pocket = {
  name: 'watchpocket.pocket',
  options: {
    //Constants
    useVoidStores: true,
    scalePockets: true,
    //Pocket
    watchPocketWidth: { pct: 7.5, min: 5, max: 10, menu: 'pockets.watchPockets' },
    watchPocketDepth: { pct: 6.25, min: 5, max: 10, menu: 'pockets.watchPockets' },
    watchPocketCurveDepth: {
      pct: (1 / 3) * 100,
      min: 0,
      max: (2 / 3) * 100,
      menu: 'pockets.watchPockets',
    },
    watchPocketCurveCpDepth: { pct: 50, min: 0, max: 100, menu: 'pockets.watchPockets' },
    watchPocketCurveCpWidth: { pct: 75, min: 0, max: 100, menu: 'pockets.watchPockets' },
    //Construction
    watchPocketTopSaWidth: { pct: 2, min: 1, max: 3, menu: 'construction' },
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
      void store.setIfUnset('insertSeamLength', 1016)
    }

    let width
    let depth
    if (!options.scalePockets) {
      width = 76.2
      depth = 63.5
    } else {
      width = store.get('insertSeamLength') * options.watchPocketWidth
      depth = store.get('insertSeamLength') * options.watchPocketDepth
    }

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
    points.curveStartCp2 = points.curveStart.shiftFractionTowards(
      points.bottomLeft,
      options.watchPocketCurveCpDepth
    )
    points.bottomMidCp1 = points.bottomMid.shiftFractionTowards(
      points.bottomLeft,
      options.watchPocketCurveCpWidth
    )
    points.bottomMidCp2 = points.bottomMidCp1.flipX(points.bottomMid)
    points.curveEndCp1 = points.curveStartCp2.flipX(points.bottomMid)
    //paths
    paths.saBase = new Path()
      .move(points.topLeft)
      .line(points.curveStart)
      .curve(points.curveStartCp2, points.bottomMidCp1, points.bottomMid)
      .curve(points.bottomMidCp2, points.curveEndCp1, points.curveEnd)
      .line(points.topRight)
      .hide()

    paths.seam = paths.saBase.clone().line(points.topLeft).close().unhide()
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
        cutNr: 1,
        scale: 0.25,
      })
      if (sa) {
        const watchPocketTopSa = sa * options.watchPocketTopSaWidth * 100

        points.saTopRight = points.topRight.translate(sa, -watchPocketTopSa)
        points.saTopLeft = points.saTopRight.flipX()
        paths.sa = paths.saBase
          .offset(sa)
          .line(points.saTopRight)
          .line(points.saTopLeft)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
