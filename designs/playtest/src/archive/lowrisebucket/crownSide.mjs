import { crownTop } from './crownTop.mjs'

export const crownSide = {
  name: 'playtest.crownSide',
  after: crownTop,
  options: {
    crownSideNumber: { count: 2, min: 1, max: 8, menu: 'style' },
  },
  draft: ({
    store,
    sa,
    Point,
    points,
    Path,
    paths,
    options,
    absoluteOptions,
    complete,
    paperless,
    macro,
    measurements,
    part,
    utils,
    snippets,
    Snippet,
  }) => {
    //measures
    const headCircumference = store.get('headCircumference')
    const crownSideWidth = store.get('crownCircumference') * 0.25 - store.get('crownTopRadius')
    const crownTopCircumference = store.get('crownTopCircumference')

    const angleRads = (headCircumference - crownTopCircumference) / crownSideWidth
    const angleDeg = utils.rad2deg(angleRads) * (1 / options.crownSideNumber)
    const radius = headCircumference / angleRads

    const bottomCpDist =
      (4 / 3) * radius * Math.tan((angleRads / 8) * (1 / options.crownSideNumber))
    const topCpDist =
      (4 / 3) *
      (radius - crownSideWidth) *
      Math.tan((angleRads / 8) * (1 / options.crownSideNumber))
    const width = crownTopCircumference > headCircumference ? crownSideWidth * -1 : crownSideWidth

    //let's begin
    points.origin = new Point(0, 0)
    points.bottomLeft = points.origin.shift(0, radius)
    points.bottomMid = points.bottomLeft.rotate(angleDeg * 0.5, points.origin)
    points.bottomRight = points.bottomMid.rotate(angleDeg * 0.5, points.origin)
    points.topLeft = points.bottomLeft.shiftTowards(points.origin, width)
    points.topMid = points.bottomMid.shiftTowards(points.origin, width)
    points.topRight = points.bottomRight.shiftTowards(points.origin, width)
    points.bottomLeftCp2 = points.bottomLeft.shift(90, bottomCpDist)
    points.bottomMidCp1 = points.bottomMid.shift(
      points.bottomMid.angle(points.topMid) + 90,
      bottomCpDist
    )
    points.bottomMidCp2 = points.bottomMid.shift(
      points.bottomMid.angle(points.topMid) - 90,
      bottomCpDist
    )
    points.bottomRightCp1 = points.bottomRight.shift(
      points.bottomRight.angle(points.topRight) + 90,
      bottomCpDist
    )
    points.topRightCp2 = points.topRight.shift(
      points.topRight.angle(points.bottomRight) - 90,
      topCpDist
    )
    points.topMidCp1 = points.topMid.shift(points.topMid.angle(points.bottomMid) + 90, topCpDist)
    points.topMidCp2 = points.topMid.shift(points.topMid.angle(points.bottomMid) - 90, topCpDist)
    points.topLeftCp1 = points.topLeft.shift(
      points.topLeft.angle(points.bottomLeft) + 90,
      topCpDist
    )
    //paths
    paths.saBottom = new Path()
      .move(points.bottomLeft)
      .curve(points.bottomLeftCp2, points.bottomMidCp1, points.bottomMid)
      .curve(points.bottomMidCp2, points.bottomRightCp1, points.bottomRight)
      .hide()

    paths.saTop = new Path()
      .move(points.topRight)
      .curve(points.topRightCp2, points.topMidCp1, points.topMid)
      .curve(points.topMidCp2, points.topLeftCp1, points.topLeft)
      .hide()

    paths.seam = paths.saBottom
      .clone()
      .line(points.topRight)
      .join(paths.saTop)
      .line(points.bottomLeft)
      .close()

    return part
  },
}
