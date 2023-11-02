import { pctBasedOn } from '@freesewing/core'
import { belt } from './belt.mjs'

export const beltLoops = {
  name: 'siona.beltLoops',
  after: belt,
  options: {
    //Constant
    beltLoopLength: 1.5,
    //Style
    beltLoops: { bool: true, menu: 'style' },
    beltLoopNumber: { count: 3, min: 1, max: 7, menu: 'style' },
    beltLoopWidth: {
      pct: 1.1,
      min: 1,
      max: 6,
      snap: 5,
      ...pctBasedOn('waist'),
      menu: 'style',
    },
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
    part,
    absoluteOptions,
    log,
  }) => {
    if (
      !options.beltLoops ||
      options.bandType != 'belt' ||
      store.get('channelInnerRadius') + store.get('bandWidth') > store.get('outerRadius')
    ) {
      if (store.get('channelInnerRadius') + store.get('bandWidth') > store.get('outerRadius')) {
        log.info('lengthToShortForBelt')
      }
      return part.hide()
    }
    //measurements

    //let's begin
    points.topLeft = new Point(0, 0)
    points.topRight = new Point(absoluteOptions.beltLoopWidth, 0)
    points.bottomLeft = new Point(
      0,
      store.get('bandWidth') * options.beltLoopLength * options.beltLoopNumber
    )
    points.bottomRight = new Point(points.topRight.x, points.bottomLeft.y)

    //paths
    paths.saLeft = new Path().move(points.topLeft).line(points.bottomLeft).hide()

    paths.saRight = new Path().move(points.bottomRight).line(points.topRight).hide()

    paths.seam = new Path()
      .move(points.topRight)
      .line(points.topLeft)
      .join(paths.saLeft)
      .line(points.bottomRight)
      .join(paths.saRight)
      .close()

    //details
    //grainline
    points.grainlineFrom = points.topLeft.shiftFractionTowards(points.topRight, 0.25)
    points.grainlineTo = new Point(points.grainlineFrom.x, points.bottomLeft.y)
    macro('grainline', {
      from: points.grainlineFrom,
      to: points.grainlineTo,
    })
    //title
    points.title = new Point(points.topRight.x * (1 / 3), points.bottomRight.y * 0.25)
    macro('title', { at: points.title, nr: 5, title: 'beltLoops', scale: 0.1 })

    //cutting lines
    for (let i = 0; i < options.beltLoopNumber - 1; i++) {
      points['cutlineFrom' + i] = points.topLeft.shiftFractionTowards(
        points.bottomLeft,
        (i + 1) / options.beltLoopNumber
      )
      points['cutlineTo' + i] = new Point(points.topRight.x, points['cutlineFrom' + i].y)

      paths['cutline' + i] = new Path()
        .move(points['cutlineFrom' + i])
        .line(points['cutlineTo' + i])
        .attr('class', 'various sa')
        .attr('data-text', 'cuttingLine')
        .attr('data-text-class', 'center')
    }

    if (sa) {
      paths.sa = paths.saLeft
        .offset(absoluteOptions.beltLoopWidth)
        .line(points.bottomLeft)
        .line(points.bottomRight)
        .join(paths.saRight.offset(absoluteOptions.beltLoopWidth))
        .line(points.topRight)
        .line(points.topLeft)
        .close()
        .attr('class', 'fabric sa')
    }

    if (paperless) {
      macro('vd', {
        from: points.topLeft,
        to: points.bottomLeft,
        x: points.topLeft.x - absoluteOptions.beltLoopWidth - 30,
        force: true,
        id: 'vLength',
      })
      if (options.beltLoopNumber > 1) {
        macro('vd', {
          from: points.topLeft,
          to: points.cutlineFrom0,
          x: points.topLeft.x - absoluteOptions.beltLoopWidth - 15,
          force: true,
          id: 'vCutLength',
        })
      }
      macro('hd', {
        from: points.topLeft,
        to: points.topRight,
        y: points.topLeft.y - 15,
        force: true,
        id: 'vWidth',
      })
    }

    return part
  },
}
