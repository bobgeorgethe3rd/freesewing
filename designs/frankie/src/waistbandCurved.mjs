import { mergeOptions } from '@freesewing/core'

export const waistbandCurved = {
  name: 'frankie.waistbandCurved',
  draft: ({
    store,
    sa,
    Point,
    points,
    Path,
    paths,
    utils,
    macro,
    options,
    paperless,
    absoluteOptions,
  }) => {
    //measures
    const waistbandLength = store.get('waistbandLength')
    const waistbandLengthTop = store.get('waistbandLengthTop')
    const waistbandWidth =
      waistbandLengthTop > waistbandLength
        ? absoluteOptions.waistbandWidth * -1
        : absoluteOptions.waistbandWidth
    const waistbandOverlap = store.get('waistbandOverlap')
    const waistbandPlacketWidth = store.get('waistbandPlacketWidth')

    const angleRads = (waistbandLength - waistbandLengthTop) / absoluteOptions.waistbandWidth
    const radius = waistbandLength / angleRads

    const bottomCpDistance = (4 / 3) * radius * Math.tan(angleRads / 8)
    const topCpDistance =
      (4 / 3) * (radius - absoluteOptions.waistbandWidth) * Math.tan(angleRads / 8)

    points.bottomMid = new Point(0, 0)
    points.origin = points.bottomMid.shift(90, radius)
    points.bottomLeft = points.bottomMid.rotate(utils.rad2deg(angleRads) / -2, points.origin)
    points.bottomRight = points.bottomLeft.flipX(points.bottomMid)
    points.topLeft = points.bottomLeft.shiftTowards(points.origin, waistbandWidth)
    points.topRight = points.topLeft.flipX(points.bottomMid)
    points.topMid = points.bottomMid.shiftTowards(points.origin, waistbandWidth)
    points.bottomLeftCp2 = points.bottomLeft
      .shiftTowards(points.topLeft, bottomCpDistance)
      .rotate(-90, points.bottomLeft)
    points.bottomMidCp1 = points.bottomMid
      .shiftTowards(points.topMid, bottomCpDistance)
      .rotate(90, points.bottomMid)
    points.bottomMidCp2 = points.bottomMidCp1.flipX(points.bottomMid)
    points.bottomRightCp1 = points.bottomLeftCp2.flipX(points.bottomMid)
    points.topRightCp2 = points.topRight
      .shiftTowards(points.bottomRight, topCpDistance)
      .rotate(-90, points.topRight)
    points.topMidCp1 = points.topMid
      .shiftTowards(points.bottomMid, topCpDistance)
      .rotate(90, points.topMid)
    points.topMidCp2 = points.topMidCp1.flipX(points.bottomMid)
    points.topLeftCp1 = points.topRightCp2.flipX(points.bottomMid)

    //extensions
    points.bottomLeftEx = points.bottomLeft
      .shiftTowards(points.topLeft, waistbandOverlap)
      .rotate(90, points.bottomLeft)
    points.topLeftEx = points.topLeft
      .shiftTowards(points.bottomLeft, waistbandOverlap)
      .rotate(-90, points.topLeft)

    points.bottomRightEx = points.bottomRight
      .shiftTowards(points.topRight, waistbandPlacketWidth)
      .rotate(-90, points.bottomRight)
    points.topRightEx = points.topRight
      .shiftTowards(points.bottomRight, waistbandPlacketWidth)
      .rotate(90, points.topRight)

    //paths
    paths.saBottom = new Path()
      .move(points.bottomLeft)
      .curve(points.bottomLeftCp2, points.bottomMidCp1, points.bottomMid)
      .curve(points.bottomMidCp2, points.bottomRightCp1, points.bottomRight)
      .hide()

    paths.seam = paths.saBottom
      .clone()
      .line(points.bottomRightEx)
      .line(points.topRightEx)
      .line(points.topRight)
      .curve(points.topRightCp2, points.topMidCp1, points.topMid)
      .curve(points.topMidCp2, points.topLeftCp1, points.topLeft)
      .line(points.topLeftEx)
      .line(points.bottomLeftEx)
      .line(points.bottomLeft)
      .close()
      .unhide()
      .setClass('fabric')

    if (sa) {
      paths.sa = paths.seam.offset(sa).close().setClass('fabric sa')
    }
    //details
    //grainline
    points.grainlineFrom = points.topMid.shiftFractionTowards(points.topMidCp1, 0.1)
    points.grainlineTo = new Point(points.grainlineFrom.x, points.bottomMid.y)
    //notches
    points.bottomLeftNotch = paths.saBottom.shiftAlong(store.get('waistFront'))
    points.topLeftNotch = points.bottomLeftNotch.shiftTowards(points.origin, waistbandWidth)
    points.bottomRightNotch = points.bottomLeftNotch.flipX(points.bottomMid)
    points.topRightNotch = points.topLeftNotch.flipX(points.bottomMid)
    //title
    points.title = points.topMid
      .shiftFractionTowards(points.topMidCp2, 0.5)
      .shift(-90, absoluteOptions.waistbandWidth * 0.5)
    //button & buttonholes
    points.button = points.bottomRightEx.shiftFractionTowards(points.topRight, 0.5)
    points.buttonhole = paths.saBottom
      .shiftAlong(waistbandPlacketWidth * 0.5)
      .shiftTowards(points.origin, waistbandWidth * 0.5)
    //paperless
    if (paperless) {
      macro('vd', {
        from: points.bottomMid,
        to: points.origin,
        x: points.bottomMid.x,
        id: 'radiusMid',
      })
      macro('vd', {
        from: points.topMid,
        to: points.origin,
        x: points.bottomMid.x - 15,
        id: 'radiusTopMid',
      })
      macro('ld', {
        from: points.bottomLeft,
        to: points.origin,
        id: 'radiusLeft',
      })
      macro('ld', {
        from: points.bottomRight,
        to: points.origin,
        id: 'radiusRight',
      })
      macro('vd', {
        from: points.bottomMid,
        to: points.topMid,
        x: points.topMid.x - 15,
        id: 'width',
      })
      macro('pd', {
        path: paths.saBottom,
        d: sa + 15,
        id: 'bottom',
      })
      macro('ld', {
        from: points.bottomRight,
        to: points.bottomRightEx,
        d: -sa - 15,
        id: 'ld0',
      })
      macro('ld', {
        from: points.bottomRightEx,
        to: points.topRightEx,
        d: -sa - 15,
        id: 'ld1',
      })
      if (options.waistbandOverlap > 0) {
        macro('ld', {
          from: points.bottomLeftEx,
          to: points.bottomLeft,
          d: -sa - 15,
          id: 'ld2',
        })
      }
      macro('ld', {
        from: points.bottomLeftEx,
        to: points.topLeftEx,
        d: sa + 15,
        id: 'ld3',
      })
    }
  },
}
