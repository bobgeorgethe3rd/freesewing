import { pluginBundle } from '@freesewing/plugin-bundle'

export const beltLoops = {
  name: 'beltloops.beltLoops',
  options: {
    //Constants
    useVoidStores: true,
    //Style
    beltLoopNumber: { count: 5, min: 1, max: 10, menu: 'style' },
    beltLoopType: { dflt: 'double', list: ['single', 'double'], menu: 'style' },
  },
  plugins: [pluginBundle],
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
      void store.setIfUnset('beltLoopWidth', 10)
      void store.setIfUnset('beltLoopLength', 100)
    }

    const length = store.get('beltLoopLength') * options.beltLoopNumber
    let width
    if (options.beltLoopType == 'single') {
      width = store.get('beltLoopWidth')
    } else {
      width = store.get('beltLoopWidth') * 2
    }

    //begin
    points.topLeft = new Point(0, 0)
    points.topRight = points.topLeft.shift(0, width)
    points.bottomLeft = points.topLeft.shift(-90, length)
    points.bottomRight = new Point(points.topRight.x, points.bottomLeft.y)

    paths.seam = new Path()
      .move(points.topLeft)
      .line(points.bottomLeft)
      .line(points.bottomRight)
      .line(points.topRight)
      .line(points.topLeft)
      .close()

    if (complete) {
      //grainline
      points.grainlineFrom = points.topLeft.shift(0, store.get('beltLoopWidth') * 0.5)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.bottomLeft.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //foldline
      if (options.beltLoopType == 'double') {
        points.foldlineFrom = points.topLeft.shiftFractionTowards(points.topRight, 0.5)
        points.foldlineTo = new Point(points.foldlineFrom.x, points.bottomLeft.y)

        paths.foldline = new Path()
          .move(points.foldlineFrom)
          .line(points.foldlineTo)
          .attr('class', 'interfacing')
          .attr('data-text', 'Fold-Line')
          .attr('data-text-class', 'center')
      }
      //cut lines
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
          .attr('data-text', 'Cut Line')
          .attr('data-text-class', 'center')
      }
      //title
      points.title = new Point(points.topRight.x * (5 / 8), points.bottomRight.y / 4)
      macro('title', {
        at: points.title,
        nr: 1,
        title: 'Belt Loop',
        scale: 0.1,
      })

      if (sa) {
        let beltLoopSa
        if (options.beltLoopType == 'single') {
          beltLoopSa = store.get('beltLoopWidth')
        } else {
          beltLoopSa = sa
        }
        points.saTopLeft = points.topLeft.shift(180, beltLoopSa)
        points.saBottomLeft = points.bottomLeft.shift(180, beltLoopSa)
        points.saBottomRight = points.bottomRight.shift(0, beltLoopSa)
        points.saTopRight = points.topRight.shift(0, beltLoopSa)

        paths.sa = new Path()
          .move(points.saTopLeft)
          .line(points.saBottomLeft)
          .line(points.saBottomRight)
          .line(points.saTopRight)
          .line(points.saTopLeft)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
