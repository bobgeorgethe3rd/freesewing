import { backBase } from './backBase.mjs'
import { skirtBase } from './skirtBase.mjs'

export const placket = {
  name: 'scott.placket',
  after: [backBase, skirtBase],
  options: {
    //Style
    placketFolded: { bool: true, menu: 'style' },
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
    Snippet,
    absoluteOptions,
  }) => {
    //set render
    if (
      options.closurePosition != 'back' ||
      options.placketStyle == 'none' ||
      options.placketStyle == 'inbuilt'
    ) {
      part.hide()
      return part
    }
    //measures
    const placketWidth = store.get('placketWidth')
    let width = placketWidth
    if (options.placketFolded && options.placketStyle == 'separate') {
      width = width * 2
    }
    let length = store.get('backPlacketLength')
    if (options.waistbandStyle == 'none' && options.skirtStyle != 'none') {
      length = length + store.get('skirtLength')
    }
    //let's begin
    points.topRight = new Point(0, 0)
    points.topLeft = points.topRight.shift(180, width)
    points.bottomLeft = points.topLeft.shift(-90, length)
    points.bottomRight = new Point(points.topRight.x, points.bottomLeft.y)

    //paths
    paths.seam = new Path()
      .move(points.topLeft)
      .line(points.bottomLeft)
      .line(points.bottomRight)
      .line(points.topRight)
      .line(points.topLeft)
      .close()

    if (complete) {
      //grainline
      points.grainlineFrom = points.topLeft.shift(0, placketWidth * 0.25)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.bottomLeft.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      if (options.waistbandStyle == 'none' && options.skirtStyle != 'none') {
        points.leftNotch = points.topLeft.shift(-90, store.get('backPlacketLength'))
        points.rightNotch = new Point(points.topRight.x, points.leftNotch.y)
        macro('sprinkle', {
          snippet: 'notch',
          on: ['leftNotch', 'rightNotch'],
        })
      }
      //title
      points.title = new Point(points.topRight.x - placketWidth * 0.75, points.bottomLeft.y / 2)
      macro('title', {
        at: points.title,
        nr: '12',
        title: 'Placket',
        scale: 0.15,
      })
      //foldline
      if (options.placketFolded && options.placketStyle == 'separate') {
        points.foldlineFrom = points.topLeft.shiftFractionTowards(points.topRight, 0.5)
        points.foldlineTo = new Point(points.foldlineFrom.x, points.bottomLeft.y)
        paths.foldLine = new Path()
          .move(points.foldlineFrom)
          .line(points.foldlineTo)
          .attr('class', 'mark')
          .attr('data-text', 'Fold - Line')
          .attr('data-text-class', 'center')
      }
      if (sa) {
        points.saTopLeft = points.topLeft.translate(-sa, -sa)
        points.saTopRight = points.topRight.translate(sa, -sa)
        points.saBottomRight = points.bottomRight.translate(sa, sa)
        points.saBottomLeft = points.bottomLeft.translate(-sa, sa)

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
