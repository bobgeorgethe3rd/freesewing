import { sleeve } from './sleeve.mjs'

export const overPlacket = {
  name: 'fullshirtsleeve.overPlacket',
  after: sleeve,
  options: {
    sleeveOverPlacketWidth: { pct: 15.5, min: 10, max: 20, menu: 'sleeves.plackets' },
    sleeveOverPlacketTopFactor: { pct: 40, min: 30, max: 100, menu: 'sleeves.plackets' },
  },
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
  }) => {
    //measures
    const sleeveSlitLength = store.get('sleeveSlitLength')
    const overPlacketWidth = measurements.wrist * options.sleeveOverPlacketWidth
    const overPlacketTopLength = overPlacketWidth * options.sleeveOverPlacketTopFactor
    const overPlacketLength = sleeveSlitLength + overPlacketTopLength
    //let's begin
    points.origin = new Point(0, 0)
    points.topLeft = points.origin.shift(-90, overPlacketTopLength)
    points.bottomLeft = points.origin.shift(-90, overPlacketLength)
    points.bottomRight = points.bottomLeft.shift(0, overPlacketWidth)
    points.topRight = new Point(points.bottomRight.x, points.topLeft.y)
    points.topMid = points.topLeft.shiftFractionTowards(points.topRight, 0.5)
    points.peakMid = points.topMid.shift(90, overPlacketTopLength)

    paths.test = new Path()
      .move(points.topLeft)
      .line(points.bottomLeft)
      .line(points.bottomRight)
      .line(points.topRight)
      .line(points.peakMid)
      .line(points.topLeft)

    return part
  },
}
