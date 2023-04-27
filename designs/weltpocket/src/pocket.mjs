import { pluginBundle } from '@freesewing/plugin-bundle'

export const pocket = {
  name: 'weltpocket.pocket',
  options: {
    //Constants
    useVoidStores: true,
    cpFraction: 0.55191502449,
    //Pockets
    weltPocketOpeningWidth: { pct: 62.2, min: 50, max: 80, menu: 'pockets.weltPockets' },
    weltPocketWidth: { pct: 28.6, min: 20, max: 40, menu: 'pockets.weltPockets' },
    weltPocketDepth: { pct: 16.9, min: 15, max: 40, menu: 'pockets.weltPockets' },
    weltPocketCurve: { pct: (1 / 3) * 100, min: 0, max: 100, menu: 'pockets.weltPockets' },
    weltPocketStyle: { dflt: 'curved', list: ['straight', 'curved'], menu: 'pockets.weltPockets' },
    //Construction
    pocketBagSaWidth: { pct: 2, min: 1, max: 3, menu: 'construction' },
    //Advanced
    weltToAnchorLength: { pct: 0, min: -25, max: 50, menu: 'advanced.pockets' },
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
      void store.setIfUnset('weltPocketOpeningWidth', 214 * options.weltPocketOpeningWidth)
      void store.setIfUnset('insertSeamLength', 1184)
      void store.setIfUnset('weltToAnchor', 43.875 * (1 + options.weltToAnchorLength))
    }

    let openingWidth = store.get('weltPocketOpeningWidth')
    let width = openingWidth * (1 + options.weltPocketWidth)
    let depth = store.get('insertSeamLength') * options.weltPocketDepth
    let toAnchor = store.get('weltToAnchor') * (1 + options.weltToAnchorLength)

    //let's begin
    points.openingMid = new Point(0, 0)
    points.openingLeft = points.openingMid.shift(180, openingWidth / 2)
    points.openingRight = points.openingLeft.rotate(180, points.openingMid)

    points.left = points.openingMid.shift(180, width / 2)
    points.right = points.left.rotate(180, points.openingMid)
    points.topLeft = points.left.shift(90, toAnchor)
    points.topRight = new Point(points.right.x, points.topLeft.y)

    points.bottomMid = points.openingMid.shift(-90, depth)
    points.bottomLeftCorner = points.bottomMid.shift(180, width / 2)

    points.bottomLeftCurveEnd = points.bottomLeftCorner.shiftFractionTowards(
      points.bottomMid,
      options.weltPocketCurve
    )
    points.bottomLeftCurveStart = points.bottomLeftCurveEnd.rotate(90, points.bottomLeftCorner)
    points.bottomLeftCp1 = points.bottomLeftCurveStart.shiftFractionTowards(
      points.bottomLeftCorner,
      options.cpFraction
    )
    points.bottomLeftCp2 = points.bottomLeftCp1.rotate(-90, points.bottomLeftCorner)

    points.bottomRightCurveStart = points.bottomLeftCurveEnd.flipX(points.bottomMid)
    points.bottomRightCurveEnd = points.bottomLeftCurveStart.flipX(points.bottomMid)
    points.bottomRightCp1 = points.bottomLeftCp2.flipX(points.bottomMid)
    points.bottomRightCp2 = points.bottomLeftCp1.flipX(points.bottomMid)

    const drawSaBase = () => {
      if (options.weltPocketStyle == 'straight') {
        return new Path()
          .move(points.topLeft)
          .line(points.bottomLeftCurveStart)
          .line(points.bottomLeftCurveEnd)
          .line(points.bottomRightCurveStart)
          .line(points.bottomRightCurveEnd)
          .line(points.topRight)
      } else {
        return new Path()
          .move(points.topLeft)
          .line(points.bottomLeftCurveStart)
          .curve(points.bottomLeftCp1, points.bottomLeftCp2, points.bottomLeftCurveEnd)
          .line(points.bottomRightCurveStart)
          .curve(points.bottomRightCp1, points.bottomRightCp2, points.bottomRightCurveEnd)
          .line(points.topRight)
      }
    }

    paths.opening = new Path()
      .move(points.openingLeft)
      .line(points.openingRight)
      .attr('class', 'interfacing')

    paths.saTop = new Path().move(points.topRight).line(points.topLeft).hide()

    paths.seam = drawSaBase().join(paths.saTop).close()

    if (complete) {
      //grainline
      points.grainlineFrom = points.openingMid
      points.grainlineTo = points.bottomMid
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      macro('sprinkle', {
        snippet: 'notch',
        on: ['openingLeft', 'openingRight'],
      })
      //title
      points.title = new Point(points.openingLeft.x, points.bottomMid.y / 2)
      macro('title', {
        nr: 1,
        title: 'Welt Pocket Bag',
        at: points.title,
        scale: 0.75,
      })
      //paths
      paths.opening.attr('data-text', 'Pocket Opening')

      if (sa) {
        paths.sa = drawSaBase()
          .offset(sa * options.pocketBagSaWidth * 100)
          .join(paths.saTop.offset(sa * 2))
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
