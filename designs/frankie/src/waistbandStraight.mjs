export const waistbandStraight = {
  name: 'frankie.waistbandStraight',
  draft: ({
    store,
    sa,
    Point,
    points,
    Path,
    paths,
    options,
    complete,
    snippets,
    Snippet,
    macro,
    paperless,
    expand,
    units,
    part,
    absoluteOptions,
  }) => {
    //measures
    const waistbandLength = store.get('waistbandLength')
    const waistbandOverlap = store.get('waistbandOverlap')
    const waistbandPlacketWidth = store.get('waistbandPlacketWidth')
    const waistbandWidth = options.waistbandFolded
      ? absoluteOptions.waistbandWidth * 2
      : absoluteOptions.waistbandWidth
    //expand
    if (!expand && !options.waistbandCurved) {
      store.flag.note({
        msg: `franklin:waistbandStraight`,
        notes: [sa ? 'flag:saIncluded' : 'flag:saExcluded', 'flag:partHiddenByExpand'],
        replace: {
          width: units(waistbandWidth + sa * 2),
          length: units(waistbandPlacketWidth + waistbandLength + waistbandOverlap + sa * 2),
          overlap: options.waistbandOverlap,
          placketWidth: waistbandPlacketWidth,
        },
        suggest: {
          text: 'flag:show',
          icon: 'expand',
          update: {
            settings: ['expand', 1],
          },
        },
      })
      return part.hide()
    } else {
      store.flag.preset('expandIsOff')
    }
    //let's begin
    points.origin = new Point(0, 0)
    points.topLeft = points.origin.translate(waistbandLength / -2, waistbandWidth / -2)
    points.bottomLeft = points.topLeft.flipY(points.origin)
    points.bottomRight = points.bottomLeft.flipX(points.origin)
    points.topRight = points.bottomRight.flipY(points.origin)
    points.topLeftEx = points.topLeft.shift(180, waistbandOverlap)
    points.bottomLeftEx = points.topLeftEx.flipY(points.origin)
    points.topRightEx = points.topRight.shift(0, waistbandPlacketWidth)
    points.bottomRightEx = points.topRightEx.flipY(points.origin)
    //paths
    paths.seam = new Path()
      .move(points.topLeftEx)
      .line(points.bottomLeftEx)
      .line(points.bottomRightEx)
      .line(points.topRightEx)
      .line(points.topLeftEx)
      .close()
      .setClass('fabric')

    if (sa) {
      paths.sa = paths.seam.offset(sa).close().setClass('fabric sa')
    }

    //details
    //grainline
    points.grainlineFrom = new Point(points.topLeft.x * 0.75, points.topLeft.y)
    points.grainlineTo = new Point(points.grainlineFrom.x, points.bottomLeft.y)
    //notches
    points.bottomMid = new Point(points.origin.x, points.bottomLeft.y)
    points.topMid = new Point(points.origin.x, points.topLeft.y)
    points.bottomLeftNotch = points.bottomLeft.shift(0, store.get('waistFront'))
    points.topLeftNotch = points.bottomLeftNotch.flipY(points.origin)
    points.bottomRightNotch = points.bottomLeftNotch.flipX(points.origin)
    points.topRightNotch = points.bottomRightNotch.flipY(points.origin)
    //title
    points.title = new Point(points.topRight.x / 4, points.origin.y)
    //button & buttonholes
    points.button = points.bottomRightEx.translate(
      waistbandPlacketWidth / -2,
      absoluteOptions.waistbandWidth / -2
    )
    points.buttonhole = points.bottomLeft.translate(
      waistbandPlacketWidth / 2,
      absoluteOptions.waistbandWidth / -2
    )
    //foldline
    if (options.waistbandFolded) {
      store.cutlist.setCut({ cut: 1, from: 'fabric', identical: 'true' })
      points.buttonF = points.button.flipY(points.origin)
      snippets.buttonF = new Snippet('button', points.buttonF).attr('data-scale', 2)
      points.buttonholeF = points.buttonhole.flipY(points.origin)
      snippets.buttonholeF = new Snippet('buttonhole', points.buttonholeF)
        .attr('data-rotate', 90)
        .attr('data-scale', 2)
      if (complete) {
        points.foldlineFrom = new Point(points.topLeftEx.x, points.origin.y)
        points.foldlineTo = new Point(points.topRightEx.x, points.origin.y)
        paths.foldine = new Path()
          .move(points.foldlineFrom)
          .line(points.foldlineTo)
          .setClass('fabric help')
          .setText('foldine')
      }
    }
    //paperless
    if (paperless) {
      macro('hd', {
        from: points.bottomLeft,
        to: points.bottomRight,
        y: points.bottomLeft.y + sa + 15,
        id: 'hd0',
      })
      macro('hd', {
        from: points.bottomRight,
        to: points.bottomRightEx,
        y: points.bottomLeft.y + sa + 15,
        id: 'hd1',
      })
      macro('hd', {
        from: points.bottomLeftEx,
        to: points.bottomRightEx,
        y: points.bottomLeft.y + sa + 30,
        id: 'hd2',
      })
      if (options.waistbandOverlap > 0) {
        macro('hd', {
          from: points.bottomLeftEx,
          to: points.bottomLeft,
          y: points.bottomLeft.y + sa + 15,
          id: 'hd3',
        })
      }
      macro('vd', {
        from: points.bottomLeftEx,
        to: points.topLeftEx,
        x: points.bottomLeftEx.x - sa - 15,
        id: 'vd0',
      })
    }
  },
}
