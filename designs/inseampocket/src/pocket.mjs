import { pluginBundle } from '@freesewing/plugin-bundle'

export const pocket = {
  name: 'inseampocket.pocket',
  options: {
    //Constants
    useVoidStores: true,
    // cpFraction: 0.55191502449,
    //Pocket
    inseamPocketWidth: { pct: 50, min: 40, max: 200, menu: 'pockets.inseamPockets' },
    inseamPocketOpening: { pct: 6.4, min: 5, max: 15, menu: 'pockets.inseamPockets' },
    inseamPocketOpeningLength: { pct: 63.5, min: 40, max: 70, menu: 'pockets.inseamPockets' },
    inseamPocketDepth: { pct: 18.5, min: 15, max: 40, menu: 'pockets.inseamPockets' },
    inseamPocketAngle: { deg: 15, min: 0, max: 15, menu: 'pockets.inseamPockets' },
    inseamPocketCurve: { pct: 50, min: 0, max: 100, menu: 'pockets.inseamPockets' },
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
      store.get('insertSeamLength') * options.inseamPocketOpening - store.get('waistbandWidth')
    let openingLength = measurements.wrist * options.inseamPocketOpeningLength
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
      points.bottomLeft,
      options.inseamPocketCurve
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

    //paths
    paths.guide = new Path()
      .move(points.topRight)
      .line(points.topLeft)
      .line(points.openingTop)
      .line(points.openingBottom)
      .line(points.bottomLeft)
      .line(points.bottomMid)
      .line(points.curveBRStart)
      .curve(points.curveBRCp1, points.curveBRCp2, points.curveBREnd)
      .line(points.topRight)

    if (complete) {
      if (sa) {
      }
    }

    return part
  },
}
