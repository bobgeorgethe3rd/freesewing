import { skirtBase } from './skirtBase.mjs'
import { placket } from './placket.mjs'

export const skirtPlacket = {
  name: 'scott.skirtPlacket',
  after: placket,
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
      options.placketStyle == 'inbuilt' ||
      options.waistbandStyle == 'none'
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
    const length = store.get('skirtLength')
    const buttonholeStart = absoluteOptions.buttonholeStart
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
      //title
      points.title = new Point(points.topRight.x - placketWidth * 0.75, points.bottomLeft.y / 2)
      macro('title', {
        at: points.title,
        nr: '13',
        title: 'Placket (Skirt)',
        cutNr: 2,
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
      //buttonhole
      if (options.placketStyle == 'separate') {
        points.buttonholeStart = points.topRight.translate(
          -absoluteOptions.placketWidth * 0.5,
          buttonholeStart
        )
        const buttonholeDist = store.get('buttonholeDist')
        const skirtButtonholeNum = Math.floor((length - buttonholeStart * 2) / buttonholeDist)
        points.buttonholeEnd = points.buttonholeStart.shift(
          -90,
          buttonholeDist * skirtButtonholeNum
        )
        for (let i = 0; i <= skirtButtonholeNum; i++) {
          points['skirtButtonhole' + i] = points.buttonholeStart.shiftFractionTowards(
            points.buttonholeEnd,
            i / skirtButtonholeNum
          )
          snippets['skirtButtonhole' + i] = new Snippet(
            'buttonhole',
            points['skirtButtonhole' + i]
          ).attr('data-rotate', 90)
          snippets['skirtButton' + i] = new Snippet('button', points['skirtButtonhole' + i])
        }
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
