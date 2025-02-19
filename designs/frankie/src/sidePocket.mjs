import { back } from './back.mjs'

export const sidePocket = {
  name: 'frankie.sidePocket',
  after: back,
  options: {
    //Pockets
    sidePocketFolded: { bool: false, menu: 'pockets.sidePockets' },
    sidePocketFoldLength: { pct: 25, min: 15, max: 30, menu: 'pockets.sidePockets' },
    sidePocketPleat: { bool: false, menu: 'pockets.sidePockets' },
    sidePocketPleatWidth: { pct: 50, min: 10, max: 100, menu: 'pockets.sidePockets' },
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
    complete,
    macro,
    expand,
    units,
    part,
  }) => {
    //measures
    const sidePocketWidth = store.get('sidePocketWidth')
    const sidePocketPleatWidth = options.sidePocketPleat
      ? sidePocketWidth * options.sidePocketPleatWidth
      : 0
    const sidePocketLength = store.get('sidePocketDepth')
    const width = sidePocketWidth + sidePocketPleatWidth
    const length =
      options.sidePocketFolded && !options.sidePocketPleat
        ? sidePocketLength * 2
        : sidePocketLength * (1 + options.sidePocketFoldLength)
    //set render
    if (!options.sidePocketsBool || !expand) {
      if (!expand) {
        store.flag.note({
          msg: `frankie:cutSidePocket`,
          notes: [sa ? 'flag:saIncluded' : 'flag:saExcluded', 'flag:partHiddenByExpand'],
          replace: {
            width: units(width + sa * 2),
            length: units(length + sa * 2),
            fold: units(
              (options.sidePocketFolded
                ? sidePocketLength
                : sidePocketLength * options.sidePocketFoldLength) + sa
            ),
          },
          suggest: {
            text: 'flag:show',
            icon: 'expand',
            update: {
              settings: ['expand', 1],
            },
          },
        })
      }
      return part.hide()
    }
    //hint at expand
    if (expand && options.sidePocketsBool) {
      store.flag.preset('expandIsOff')
    }
    //let's begin
    points.origin = new Point(0, 0)
    points.topLeft = points.origin.translate(width / -2, length / -2)
    points.bottomLeft = points.topLeft.flipY(points.origin)
    points.bottomRight = points.bottomLeft.flipX(points.origin)
    points.topRight = points.bottomRight.flipY(points.origin)
    //paths
    paths.seam = new Path()
      .move(points.topLeft)
      .line(points.bottomLeft)
      .line(points.bottomRight)
      .line(points.topRight)
      .line(points.topLeft)
      .close()
      .setClass('fabric')

    if (sa) {
      paths.sa = paths.seam.offset(sa).close().setClass('fabric sa')
    }

    //details
    //grainline
    points.grainlineFrom = points.topLeft.shiftFractionTowards(points.topRight, 0.25)
    points.grainlineTo = new Point(points.grainlineFrom.x, points.bottomLeft.y)
    macro('grainline', {
      from: points.grainlineFrom,
      to: points.grainlineTo,
      grainline: true,
    })
    //notches
    points.topLeftNotch = points.bottomLeft.shift(90, sidePocketLength)
    points.topRightNotch = points.topLeftNotch.flipX(points.origin)
    macro('sprinkle', {
      snippet: 'notch',
      on: ['topLeftNotch', 'topRightNotch'],
    })
    //cutlist
    store.cutlist.setCut({ cut: 2, from: 'fabric', identical: 'true' })
    //title
    points.title = new Point(points.origin.x, points.bottomLeft.y - sidePocketLength * 0.5)
    macro('title', {
      at: points.title,
      nr: 7,
      title: 'sidePocket',
      scale: 0.5,
    })
    //foldline
    if (complete) {
      paths.foldline = new Path()
        .move(points.topLeftNotch)
        .line(points.topRightNotch)
        .setClass('fabric help')
        .setText('foldline', 'center')
    }
    //pleat lines
    if (options.sidePocketPleat) {
      store.flag.note({
        msg: `frankie:sidePocketPleatNoFold`,
      })
      if (complete) {
        points.pleatTopLeft = new Point(-sidePocketPleatWidth / 2, points.topLeft.y)
        points.pleatTopLeftFold = new Point(points.pleatTopLeft.x, points.topLeftNotch.y)
        points.pleatTopRight = new Point(sidePocketPleatWidth / 2, points.topLeft.y)
        points.pleatTopRightFold = new Point(points.pleatTopRight.x, points.topRightNotch.y)
        points.pleatBottomLeft = new Point(points.pleatTopLeft.x, points.bottomLeft.y)
        points.pleatBottomRight = new Point(points.pleatTopRight.x, points.bottomRight.y)
        paths.pleatLeft = new Path()
          .move(points.pleatTopLeft)
          .line(points.pleatBottomLeft)
          .addClass('fabric help')
          .addText('pleatLine', 'center')
        paths.pleatRight = new Path()
          .move(points.pleatTopRight)
          .line(points.pleatBottomRight)
          .addClass('fabric help')
          .addText('pleatLine', 'center')
      }
      macro('sprinkle', {
        snippet: 'notch',
        on: ['pleatTopLeftFold', 'pleatTopRightFold', 'pleatBottomLeft', 'pleatBottomRight'],
      })
    }
    //paperless
    if (paperless) {
      macro('hd', {
        from: points.bottomLeft,
        to: points.bottomRight,
        y: points.bottomLeft.y + sa + 15,
        id: 'hd',
      })
      macro('vd', {
        from: points.bottomLeft,
        to: points.topLeftNotch,
        x: points.bottomLeft.x - sa - 15,
        id: 'vd0',
      })
      macro('vd', {
        from: points.topLeftNotch,
        to: points.topLeft,
        x: points.bottomLeft.x - sa - 15,
        id: 'vd1',
      })
      macro('vd', {
        from: points.bottomLeft,
        to: points.topLeft,
        x: points.bottomLeft.x - sa - 30,
        id: 'vd2',
      })
    }
    return part
  },
}
