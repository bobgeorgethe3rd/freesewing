import { pluginBundle } from '@freesewing/plugin-bundle'

export const pocket = {
  name: 'inseampocket.pocket',
  options: {
    //Constants
    useVoidStores: true,
    //Pockets
    inseamPocketWidth: { pct: 50, min: 40, max: 200, menu: 'pockets.inseamPockets' },
    pocketOpening: { pct: 6.4, min: 5, max: 15, menu: 'pockets' },
    pocketOpeningLength: { pct: 63.5, min: 40, max: 70, menu: 'pockets' },
    inseamPocketDepth: { pct: 18.5, min: 15, max: 40, menu: 'pockets.inseamPockets' },
    inseamPocketAngle: { deg: 15, min: 0, max: 15, menu: 'pockets.inseamPockets' },
    inseamPocketCurveLeft: { pct: 100, min: 0, max: 100, menu: 'pockets.inseamPockets' },
    inseamPocketCurveRight: { pct: 75, min: 0, max: 100, menu: 'pockets.inseamPockets' },
    inseamPocketToAnchor: { pct: 100, min: 0, max: 100, menu: 'pockets.inseamPockets' },
    //Construction
    pocketBagSaWidth: { pct: 2, min: 1, max: 3, menu: 'pockets.inseamPockets' },
    //Advanced
    inseamPocketCurveLeftBalance: { pct: 100, min: 0, max: 100, menu: 'advanced' },
  },
  plugins: [pluginBundle],
  measurements: ['wrist'],
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
      void store.setIfUnset('anchorSeamLength', 423)
      void store.setIfUnset('insertSeamLength', 1184)
    }
    void store.setIfUnset('waistbandWidth', 0)
    let width = store.get('anchorSeamLength') * options.inseamPocketWidth
    let openingDepth =
      store.get('insertSeamLength') * options.pocketOpening - store.get('waistbandWidth')
    let openingLength = measurements.wrist * options.pocketOpeningLength
    let depth = store.get('insertSeamLength') * options.inseamPocketDepth

    //let's begin
    points.topLeft = new Point(0, 0)
    points.topRight = points.topLeft.shift(0, width)
    points.openingTop = points.topLeft.shift(-90, openingDepth)
    points.openingBottom = points.openingTop.shift(-90, openingLength)
    points.bottomLeft = points.openingBottom.shift(-90, depth)
    points.bottomMid = new Point(points.topRight.x / 2, points.bottomLeft.y)
    points.bottomRight = new Point(points.topRight.x, points.bottomLeft.y)
    points.rightAnchor = points.topRight.shift(-90 + options.inseamPocketAngle, 1)
    points.curveBRAnchor = utils.beamsIntersect(
      points.bottomMid,
      points.bottomRight,
      points.topRight,
      points.rightAnchor
    )

    points.curveBRStart = points.curveBRAnchor.shiftFractionTowards(
      points.bottomMid,
      options.inseamPocketCurveRight
    )
    points.curveBREnd = points.curveBRAnchor.shiftTowards(
      points.topRight,
      points.curveBRStart.dist(points.curveBRAnchor)
    )
    points.curveBRMid = points.curveBRStart.shiftFractionTowards(points.curveBREnd, 0.5)
    points.curveBROrigin = utils.beamsIntersect(
      points.curveBRStart,
      points.bottomLeft.rotate(-90, points.curveBRStart),
      points.curveBREnd,
      points.topRight.rotate(90, points.curveBREnd)
    )

    let curveBRCPDistance =
      (4 / 3) *
      points.curveBROrigin.dist(points.curveBRStart) *
      Math.tan(utils.deg2rad((points.curveBROrigin.angle(points.curveBRMid) - 270) / 2))

    points.curveBRCp1 = points.curveBRStart.shiftTowards(points.curveBRAnchor, curveBRCPDistance)
    points.curveBRCp2 = points.curveBREnd.shiftTowards(points.curveBRAnchor, curveBRCPDistance)

    points.curveBLStart = points.bottomLeft.shiftFractionTowards(
      points.openingBottom,
      options.inseamPocketCurveLeft
    )
    points.curveBLCp1Target = new Point(points.curveBRStart.x, points.curveBLStart.y)
    points.curveBLCp1 = points.curveBLStart.shiftFractionTowards(points.curveBLCp1Target, 0.1)
    points.curveBLCp2 = points.curveBRStart.shiftFractionTowards(
      points.bottomLeft,
      options.inseamPocketCurveLeftBalance
    )

    points.pocketTopLeft = points.openingTop.shiftFractionTowards(
      points.topLeft,
      options.inseamPocketToAnchor
    )
    points.pocketTopRight = utils.beamsIntersect(
      points.pocketTopLeft,
      points.pocketTopLeft.shift(0, 1),
      points.topRight,
      points.curveBREnd
    )
    //paths
    paths.anchorSeam = new Path().move(points.pocketTopRight).line(points.pocketTopLeft).hide()

    paths.insertSeam = new Path().move(points.pocketTopLeft).line(points.curveBLStart).hide()

    paths.bottomCurveRight = new Path()
      .move(points.curveBRStart)
      .curve(points.curveBRCp1, points.curveBRCp2, points.curveBREnd)
      .line(points.pocketTopRight)
      .hide()

    paths.seam = new Path()
      .move(points.curveBLStart)
      .curve(points.curveBLCp1, points.curveBLCp2, points.curveBRStart)
      .join(paths.bottomCurveRight)
      .join(paths.anchorSeam)
      .join(paths.insertSeam)
      .close()

    if (complete) {
      //grainline
      points.grainlineFrom = points.pocketTopLeft.shiftFractionTowards(points.pocketTopRight, 0.5)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.bottomLeft.y * 0.9)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      macro('sprinkle', {
        snippet: 'notch',
        on: ['openingTop', 'openingBottom'],
      })
      //title
      points.title = new Point(points.topRight.x * (2 / 3), points.bottomLeft.y / 2)
      macro('title', {
        at: points.title,
        nr: 1,
        title: 'Inseam Pocket',
        scale: 0.75,
      })

      if (sa) {
        void store.setIfUnset('anchorSeamSa', sa)
        void store.setIfUnset('insertSeamSa', sa)
        let anchorSeamSa = store.get('anchorSeamSa')
        let insertSeamSa = store.get('insertSeamSa')
        let pocketBagSaWidth = sa * options.pocketBagSaWidth * 100

        points.curveBLStartSa = points.curveBLStart.translate(-pocketBagSaWidth, pocketBagSaWidth)
        points.curveBLCp1Sa = points.curveBLCp1.translate(-pocketBagSaWidth, pocketBagSaWidth)
        points.curveBLCp2Sa = points.curveBLCp2.translate(-pocketBagSaWidth, pocketBagSaWidth)
        points.curveBRStartSa = points.curveBRStart.shift(-90, pocketBagSaWidth)

        paths.sa = new Path()
          .move(points.curveBLStartSa)
          .curve(points.curveBLCp1Sa, points.curveBLCp2Sa, points.curveBRStartSa)
          .join(paths.bottomCurveRight.offset(pocketBagSaWidth))
          .join(paths.anchorSeam.offset(anchorSeamSa))
          .join(paths.insertSeam.offset(insertSeamSa))
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
