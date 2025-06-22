import { pluginBundle } from '@freesewing/plugin-bundle'

export const pocket = {
  name: 'inseampocket.pocket',
  options: {
    //Constants
    useVoidStores: true,
    //Pockets
    pocketOpening: { pct: 6.4, min: 5, max: 15, menu: 'pockets' },
    pocketOpeningLength: { pct: 100, min: 40, max: 100, menu: 'pockets' },
    inseamPocketWidth: { pct: 50, min: 40, max: 200, menu: 'pockets.inseamPockets' },
    inseamPocketDepth: { pct: 18.5, min: 15, max: 40, menu: 'pockets.inseamPockets' },
    inseamPocketAngle: { deg: 15, min: 0, max: 15, menu: 'pockets.inseamPockets' },
    inseamPocketCurveLeft: { pct: 100, min: 0, max: 100, menu: 'pockets.inseamPockets' },
    inseamPocketCurveRight: { pct: 75, min: 0, max: 100, menu: 'pockets.inseamPockets' },
    inseamPocketToAnchor: { pct: 100, min: 0, max: 100, menu: 'pockets.inseamPockets' },
    //Construction
    pocketBagSaWidth: { pct: 1.5, min: 1, max: 3, menu: 'construction' },
    //Advanced
    inseamPocketCurveLeftBalance: { pct: 100, min: 0, max: 100, menu: 'advanced.pockets' },
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
    const width = store.get('anchorSeamLength') * options.inseamPocketWidth
    const openingDepth =
      store.get('insertSeamLength') * options.pocketOpening - store.get('waistbandWidth')
    const openingLength = measurements.wrist * options.pocketOpeningLength
    const depth = store.get('insertSeamLength') * options.inseamPocketDepth

    //let's begin
    points.topLeft = new Point(0, 0)
    points.topRight = points.topLeft.shift(0, width)
    points.openingTop = points.topLeft.shift(-90, openingDepth)
    points.openingBottom = points.openingTop.shift(-90, openingLength)
    points.bottomLeft = points.openingBottom.shift(-90, depth)
    points.bottomMid = new Point(points.topRight.x / 2, points.bottomLeft.y)
    points.bottomCurveMidAnchor = utils.beamIntersectsY(
      points.topRight,
      points.topRight.shift(-90 + options.inseamPocketAngle, 1),
      points.bottomLeft.y
    )

    points.bottomCurveMid = points.bottomCurveMidAnchor.shiftFractionTowards(
      points.bottomMid,
      options.inseamPocketCurveRight
    )
    points.bottomCurveRight = points.bottomCurveMidAnchor.shiftTowards(
      points.topRight,
      points.bottomCurveMid.dist(points.bottomCurveMidAnchor)
    )
    points.bottomCurveRightAnchor = points.bottomCurveMid.shiftFractionTowards(
      points.bottomCurveRight,
      0.5
    )
    points.bottomCurveRightOrigin = utils.beamsIntersect(
      points.bottomCurveMid,
      points.bottomLeft.rotate(-90, points.bottomCurveMid),
      points.bottomCurveRight,
      points.topRight.rotate(90, points.bottomCurveRight)
    )

    const bottomCurveRightCpDist =
      (4 / 3) *
      points.bottomCurveRightOrigin.dist(points.bottomCurveMid) *
      Math.tan(
        utils.deg2rad(
          (points.bottomCurveRightOrigin.angle(points.bottomCurveRightAnchor) - 270) / 2
        )
      )

    points.bottomCurveMidCp2 = points.bottomCurveMid.shiftTowards(
      points.bottomCurveMidAnchor,
      bottomCurveRightCpDist
    )
    points.bottomCurveRightCp1 = points.bottomCurveRight.shiftTowards(
      points.bottomCurveMidAnchor,
      bottomCurveRightCpDist
    )

    points.bottomCurveLeft = points.bottomLeft.shiftFractionTowards(
      points.openingBottom,
      options.inseamPocketCurveLeft
    )
    points.bottomCurveLeftCp2 = points.bottomCurveLeft.shiftFractionTowards(
      new Point(points.bottomCurveMid.x, points.bottomCurveLeft.y),
      0.1
    )
    points.bottomCurveMidCp1 = points.bottomCurveMid.shiftFractionTowards(
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
      points.bottomCurveRight
    )
    //paths
    paths.bottomCurveRight = new Path()
      .move(points.bottomCurveMid)
      .curve(points.bottomCurveMidCp2, points.bottomCurveRightCp1, points.bottomCurveRight)
      .line(points.pocketTopRight)
      .hide()

    paths.seam = new Path()
      .move(points.bottomCurveLeft)
      .curve(points.bottomCurveLeftCp2, points.bottomCurveMidCp1, points.bottomCurveMid)
      .join(paths.bottomCurveRight)
      .line(points.pocketTopLeft)
      .line(points.bottomCurveLeft)
      .close()
    //stores
    store.set('pocketOpening', points.topLeft.dist(points.openingTop))
    store.set('pocketOpeningLength', points.topLeft.dist(points.openingBottom))
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
        cutNr: 4,
        scale: 0.75,
      })

      if (sa) {
        void store.setIfUnset('anchorSeamSa', sa)
        void store.setIfUnset('insertSeamSa', sa)
        const anchorSeamSa = store.get('anchorSeamSa')
        const insertSeamSa = store.get('insertSeamSa')
        const pocketBagSaWidth = sa * options.pocketBagSaWidth * 100

        if (options.inseamPocketCurveLeft == 0) {
          points.saBottomCurveLeft = points.bottomCurveLeft.translate(
            -insertSeamSa,
            pocketBagSaWidth
          )
        } else {
          points.saBottomCurveLeft = points.bottomCurveLeft.translate(
            -pocketBagSaWidth,
            pocketBagSaWidth
          )
        }
        points.saBottomCurveLeftCp2 = points.bottomCurveLeftCp2.translate(
          -pocketBagSaWidth,
          pocketBagSaWidth
        )
        points.saBottomCurveMidCp1 = points.bottomCurveMidCp1.translate(
          -pocketBagSaWidth,
          pocketBagSaWidth
        )
        points.saBottomCurveMid = points.bottomCurveMid.shift(-90, pocketBagSaWidth)

        points.saPocketTopLeft = points.pocketTopLeft.translate(-insertSeamSa, -anchorSeamSa)
        points.saPocketTopRight = utils.beamIntersectsY(
          points.bottomCurveRight
            .shiftTowards(points.pocketTopRight, pocketBagSaWidth)
            .rotate(-90, points.bottomCurveRight),
          points.pocketTopRight
            .shiftTowards(points.bottomCurveRight, pocketBagSaWidth)
            .rotate(90, points.pocketTopRight),
          points.saPocketTopLeft.y
        )

        points.saPocketBottomLeft = points.bottomCurveLeft.shift(180, insertSeamSa)

        paths.sa = new Path()
          .move(points.saBottomCurveLeft)
          .curve(points.saBottomCurveLeftCp2, points.saBottomCurveMidCp1, points.saBottomCurveMid)
          .join(paths.bottomCurveRight.offset(pocketBagSaWidth))
          .line(points.saPocketTopRight)
          .line(points.saPocketTopLeft)
          .line(points.saPocketBottomLeft)
          .line(points.saBottomCurveLeft)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
