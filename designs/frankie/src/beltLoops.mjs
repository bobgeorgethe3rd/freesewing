import { back } from './back.mjs'
import { pctBasedOn } from '@freesewing/core'

export const beltLoops = {
  name: 'frankie.beltLoops',
  after: back,
  options: {
    //Style
    beltLoops: { bool: true, menu: 'style' },
    beltLoopWidth: {
      pct: 1.1,
      min: 1,
      max: 3,
      snap: 5,
      ...pctBasedOn('waist'),
      menu: 'style',
    },
    beltLoopNumber: { count: 5, min: 3, max: 10, menu: 'style' },
    beltLoopDoubleFolded: { bool: true, menu: 'style' },
  },
  draft: ({
    store,
    sa,
    Point,
    points,
    Path,
    paths,
    options,
    macro,
    complete,
    paperless,
    expand,
    units,
    part,
    absoluteOptions,
  }) => {
    //measures
    const length = absoluteOptions.waistbandWidth * 2.2 * options.beltLoopNumber
    const beltLoopWidth = options.beltLoopDoubleFolded
      ? absoluteOptions.beltLoopWidth * 2
      : absoluteOptions.beltLoopWidth

    if (!options.beltLoops || !expand) {
      if (!expand) {
        store.flag.note({
          msg: `franklin:beltLoop`,
          notes: [sa ? 'flag:saIncluded' : 'flag:saExcluded', 'flag:partHiddenByExpand'],
          replace: {
            width: units(beltLoopWidth),
            length: units(length),
            count: options.beltLoopNumber,
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
    } else {
      if (expand) {
        store.flag.preset('expandIsOff')
      }
    }

    //let's begin
    points.origin = new Point(0, 0)
    points.topLeft = points.origin.translate(beltLoopWidth / -2, length / -2)
    points.bottomLeft = points.topLeft.flipY(points.origin)
    points.bottomRight = points.bottomLeft.flipX(points.origin)
    points.topRight = points.bottomRight.flipY(points.origin)
    //paths
    paths.saLeft = new Path().move(points.topLeft).line(points.bottomLeft).hide()
    paths.saRight = new Path().move(points.bottomRight).line(points.topRight).hide()
    paths.seam = paths.saLeft
      .clone()
      .line(points.bottomRight)
      .join(paths.saRight)
      .line(points.topLeft)
      .close()
      .setClass('fabric')

    if (sa) {
      paths.sa = paths.saLeft
        .offset(absoluteOptions.beltLoopWidth)
        .line(points.bottomLeft)
        .line(points.bottomRight)
        .join(paths.saRight.offset(absoluteOptions.beltLoopWidth))
        .line(points.topRight)
        .line(points.topLeft)
        .close()
        .setClass('fabric sa')
    }
    //details
    //grainline
    points.grainlineFrom = points.topLeft.shift(0, absoluteOptions.beltLoopWidth / 2)
    points.grainlineTo = new Point(points.grainlineFrom.x, points.bottomLeft.y)
    macro('grainline', {
      from: points.grainlineFrom,
      to: points.grainlineTo,
      grainline: true,
    })
    //cutlist
    store.cutlist.setCut({ cut: 1, from: 'fabric', identical: 'true' })
    //title
    points.title = points.origin.shift(0, absoluteOptions.beltLoopWidth / 2)
    macro('title', {
      at: points.title,
      nr: 8,
      title: 'beltLoops',
      scale: 0.5,
    })
    //fold and cut lines
    if (complete) {
      if (options.beltLoopDoubleFolded) {
        points.foldlineFrom = new Point(points.origin.x, points.topLeft.y)
        points.foldlineTo = new Point(points.foldlineFrom.x, points.bottomLeft.y)
        paths.foldline = new Path()
          .move(points.foldlineFrom)
          .line(points.foldlineTo)
          .setClass('fabric help')
          .setText('foldline', 'center')
      }
      for (let i = 0; i <= options.beltLoopNumber; i++) {
        points['cutLeft' + i] = points.topLeft.shiftFractionTowards(
          points.bottomLeft,
          i / options.beltLoopNumber
        )
        points['cutRight' + i] = new Point(points.topRight.x, points['cutLeft' + i].y)
        if (i > 0 && i < options.beltLoopNumber) {
          paths['cutLine' + i] = new Path()
            .move(points['cutLeft' + i])
            .line(points['cutRight' + i])
            .setClass('various dashed')
            .setText('cutLine', 'center')
        }
      }
    }
    //paperless
    if (paperless) {
      macro('hd', {
        from: points.bottomLeft,
        to: points.bottomRight,
        y: points.bottomLeft.y + sa + 15,
        id: 'hd',
      })
      for (let i = 0; i <= options.beltLoopNumber - 1; i++) {
        macro('vd', {
          from: points['cutLeft' + (i + 1)],
          to: points['cutLeft' + i],
          x: points.bottomLeft.x - absoluteOptions.beltLoopWidth - 15,
          id: 'vd' + i,
        })
      }
      macro('vd', {
        from: points.bottomLeft,
        to: points.topLeft,
        x: points.bottomLeft.x - absoluteOptions.beltLoopWidth - 30,
        id: 'vdLength',
      })
    }
    return part
  },
}
