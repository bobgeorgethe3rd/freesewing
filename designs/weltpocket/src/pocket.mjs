import { pluginBundle } from '@freesewing/plugin-bundle'

export const pocket = {
  name: 'weltpocket.pocket',
  options: {
    //Constants
    useVoidStores: true,
    cpFraction: 0.55191502449,
    //Pockets
    weltPocketOpeningWidth: { pct: 73.7, min: 50, max: 80, menu: 'pockets.weltPockets' },
    weltPocketWidth: { pct: 28.6, min: 20, max: 40, menu: 'pockets.weltPockets' },
    weltPocketDepth: { pct: 18.7, min: 15, max: 40, menu: 'pockets.weltPockets' },
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
      void store.setIfUnset('weltPocketOpeningWidth', 190 * options.weltPocketOpeningWidth)
      void store.setIfUnset('insertSeamLength', 1070)
      void store.setIfUnset('weltToAnchor', 35)
    }

    const openingWidth = store.get('weltPocketOpeningWidth')
    const width = openingWidth * (1 + options.weltPocketWidth)
    const depth = store.get('insertSeamLength') * options.weltPocketDepth
    const toAnchor = store.get('weltToAnchor') * (1 + options.weltToAnchorLength)

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
    points.bottomLeftCurveStartCp2 = points.bottomLeftCurveStart.shiftFractionTowards(
      points.bottomLeftCorner,
      options.cpFraction
    )
    points.bottomLeftCurveEndCp1 = points.bottomLeftCurveStartCp2.rotate(
      -90,
      points.bottomLeftCorner
    )

    points.bottomRightCurveStart = points.bottomLeftCurveEnd.flipX(points.bottomMid)
    points.bottomRightCurveEnd = points.bottomLeftCurveStart.flipX(points.bottomMid)
    points.bottomRightCurveEndCp2 = points.bottomLeftCurveEndCp1.flipX(points.bottomMid)
    points.bottomRightCurveStartCp1 = points.bottomLeftCurveStartCp2.flipX(points.bottomMid)

    const drawBottom = () => {
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
          .curve(
            points.bottomLeftCurveStartCp2,
            points.bottomLeftCurveEndCp1,
            points.bottomLeftCurveEnd
          )
          .line(points.bottomRightCurveStart)
          .curve(
            points.bottomRightCurveEndCp2,
            points.bottomRightCurveStartCp1,
            points.bottomRightCurveEnd
          )
          .line(points.topRight)
      }
    }

    paths.opening = new Path()
      .move(points.openingLeft)
      .line(points.openingRight)
      .attr('class', 'interfacing')

    paths.seam = drawBottom().line(points.topLeft).close()

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
        on: ['openingLeft', 'openingMid', 'openingRight'],
      })
      //title
      points.title = new Point(points.openingLeft.x, points.bottomMid.y / 2)
      macro('title', {
        nr: 1,
        title: 'Welt Pocket Bag',
        at: points.title,
        scale: 0.5,
      })
      //paths
      paths.opening.attr('data-text', 'Pocket Opening')

      if (sa) {
        const pocketBagSa = sa * options.pocketBagSaWidth * 100

        if (options.weltPocketCurve == 0) {
          points.saBottomLeftCurveStart = points.bottomLeftCurveStart.translate(
            -pocketBagSa,
            pocketBagSa
          )
          points.saBottomLeftCurveEnd = points.saBottomLeftCurveStart
        } else {
          points.saBottomLeftCurveStart = utils.beamIntersectsX(
            points.bottomLeftCurveStart.shift(215, pocketBagSa),
            points.bottomLeftCurveStart.shift(215, pocketBagSa).shift(135, 1),
            points.bottomLeftCurveStart.x - pocketBagSa
          )

          if (options.weltPocketCurve == 1) {
            points.saBottomLeftCurveEnd = utils.beamIntersectsX(
              points.bottomLeftCurveEnd.shift(215, pocketBagSa),
              points.bottomLeftCurveEnd.shift(215, pocketBagSa).shift(315, 1),
              points.bottomLeftCurveEnd.x
            )
          } else {
            points.saBottomLeftCurveEnd = utils.beamIntersectsY(
              points.bottomLeftCurveEnd.shift(215, pocketBagSa),
              points.bottomLeftCurveEnd.shift(215, pocketBagSa).shift(315, 1),
              points.bottomLeftCurveEnd.y + pocketBagSa
            )
          }
        }

        points.saBottomRightCurveStart = points.saBottomLeftCurveEnd.flipX()
        points.saBottomRightCurveEnd = points.saBottomLeftCurveStart.flipX()

        points.saTopRight = points.topRight.translate(pocketBagSa, -sa * 2)
        points.saTopLeft = points.topLeft.translate(-pocketBagSa, -sa * 2)

        const drawSaBase = () => {
          if (options.weltPocketStyle == 'straight' || options.weltPocketCurve == 0) {
            return new Path()
              .move(points.saTopLeft)
              .line(points.saBottomLeftCurveStart)
              .line(points.saBottomLeftCurveEnd)
              .line(points.saBottomRightCurveStart)
              .line(points.saBottomRightCurveEnd)
              .line(points.saTopRight)
          } else {
            return drawBottom().offset(pocketBagSa)
          }
        }

        paths.sa = drawSaBase()
          .line(points.saTopRight)
          .line(points.saTopLeft)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
