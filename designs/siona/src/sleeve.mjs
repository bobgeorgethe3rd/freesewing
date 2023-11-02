import { dress } from './dress.mjs'

export const sleeve = {
  name: 'siona.sleeve',
  after: dress,
  measurements: ['shoulderToElbow', 'shoulderToWrist'],
  options: {
    //Fit
    wristEase: { pct: 40, min: 0, max: 50, menu: 'fit' },
    //Style
    sleeves: { bool: true, menu: 'style' },
    sleeveLength: { pct: 100, min: 10, max: 100, menu: 'style' },
    sleeveLengthBonus: { pct: 0, min: -20, max: 50, menu: 'style' },
    //Construction
    sleeveHemWidth: { pct: 2, min: 1, max: 3, menu: 'construction' },
  },
  draft: ({
    store,
    sa,
    Point,
    points,
    Path,
    paths,
    options,
    paperless,
    macro,
    measurements,
    part,
  }) => {
    if (!options.sleeves) {
      return part.hide()
    }
    //measurements
    const maxWidth = store.get('upperArmWidth') * 2
    const bottomWidth =
      maxWidth * (1 - options.sleeveLength) +
      measurements.wrist * (1 + options.wristEase) * options.sleeveLength
    let sleeveLength
    if (options.sleeveLength < 0.5) {
      sleeveLength = measurements.shoulderToElbow * options.sleeveLength * 2
    } else {
      sleeveLength =
        measurements.shoulderToElbow * (-2 * options.sleeveLength + 2) +
        measurements.shoulderToWrist * (2 * options.sleeveLength - 1)
    }
    sleeveLength = sleeveLength * (1 + options.sleeveLengthBonus)
    //let's begin
    points.topMid = new Point(0, 0)
    points.topRight = points.topMid.shift(0, maxWidth / 2)
    points.topLeft = points.topRight.flipX()
    points.bottomMid = points.topMid.shift(-90, sleeveLength)
    points.bottomRight = points.bottomMid.shift(0, bottomWidth / 2)
    points.bottomLeft = points.bottomRight.flipX()

    //paths
    paths.hemBase = new Path().move(points.bottomLeft).line(points.bottomRight).hide()

    paths.saBase = new Path()
      .move(points.bottomRight)
      .line(points.topRight)
      .line(points.topLeft)
      .line(points.bottomLeft)
      .hide()

    paths.seam = paths.hemBase.join(paths.saBase).close()

    //details
    //grainline
    points.grainlineTo = points.bottomMid.shiftFractionTowards(points.bottomLeft, 0.5)
    points.grainlineFrom = new Point(points.grainlineTo.x, points.topMid.y)
    macro('grainline', {
      from: points.grainlineFrom,
      to: points.grainlineTo,
    })
    //title
    points.title = new Point(points.bottomRight.x / 2, points.bottomMid.y / 2)
    macro('title', { at: points.title, nr: 2, title: 'sleeve', scale: 0.5 })
    //foldline
    paths.foldline = new Path()
      .move(points.topMid)
      .line(points.bottomMid)
      .attr('class', 'various')
      .attr('data-text', 'foldLine')
      .attr('data-text-class', 'center')
    if (sa) {
      paths.sa = paths.saBase
        .offset(sa * options.sideSeamSaWidth * 100)
        .join(paths.hemBase.offset(sa * options.sleeveHemWidth * 100))
        .close()
        .attr('class', 'fabric sa')
    }

    if (paperless) {
      macro('vd', {
        from: points.topLeft,
        to: points.bottomLeft,
        x: points.topLeft.x - sa * options.sideSeamSaWidth * 100 - 15,
        force: true,
        id: 'vLength',
      })
      macro('hd', {
        from: points.topLeft,
        to: points.topMid,
        y: points.topLeft.y - sa * options.sideSeamSaWidth * 100 - 15,
        force: true,
        id: 'vTopMidWidth',
      })
      macro('hd', {
        from: points.topLeft,
        to: points.topRight,
        y: points.topLeft.y - sa * options.sideSeamSaWidth * 100 - 30,
        force: true,
        id: 'vTopWidth',
      })
      macro('hd', {
        from: points.topLeft,
        to: points.bottomLeft,
        y: points.bottomLeft.y,
        force: true,
        id: 'vBottomDiff',
      })
      macro('hd', {
        from: points.bottomLeft,
        to: points.bottomMid,
        y: points.bottomLeft.y + sa * options.sleeveHemWidth * 100 + 15,
        force: true,
        id: 'vBottomMidWidth',
      })
      macro('hd', {
        from: points.bottomLeft,
        to: points.bottomRight,
        y: points.bottomLeft.y + sa * options.sleeveHemWidth * 100 + 30,
        force: true,
        id: 'vBottomWidth',
      })
    }

    return part
  },
}
