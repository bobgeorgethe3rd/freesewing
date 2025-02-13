import { back } from './back.mjs'

export const sidePocket = {
  name: 'frankie.sidePocket',
  after: back,
  options: {
    //Pockets
    sidePocketFolded: { bool: false, menu: 'pockets.sidePockets' },
    sidePocketFoldLength: { pct: 25, min: 15, max: 30, menu: 'pockets.sidePockets' },
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
    const sidePocketLength = store.get('sidePocketDepth')
    const sidePocketWidth = store.get('sidePocketWidth')
    const length = options.sidePocketFolded
      ? sidePocketLength * 2
      : sidePocketLength * (1 + options.sidePocketFoldLength)
    //set render
    if (!options.sidePocketsBool || !expand) {
      if (!expand) {
        store.flag.note({
          msg: `franklin:sidePocket`,
          notes: [sa ? 'flag:saIncluded' : 'flag:saExcluded', 'flag:partHiddenByExpand'],
          replace: {
            width: units(sidePocketWidth + sa * 2),
            length: units(length + sa * 2),
            fold: options.sidePocketFolded
              ? sidePocketLength * 0.5
              : sidePocketLength * options.sidePocketFoldLength,
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
    points.topLeft = points.origin.translate(store.get('sidePocketWidth') / -2, length / -2)
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
    if (complete)
      paths.foldline = new Path()
        .move(points.topLeftNotch)
        .line(points.topRightNotch)
        .setClass('fabric help')
        .setText('foldline', 'center')
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
