import { back } from './back.mjs'
import { skirtBase } from './skirtBase.mjs'

export const placket = {
  name: 'scott.placket',
  after: [back, skirtBase],
  options: {
    //Plackets
    placketFolded: { bool: true, menu: 'plackets' },
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
    const backPlacketLength = store.get('backPlacketLength')
    const skirtLength = store.get('skirtLength')
    let length = backPlacketLength
    if (options.waistbandStyle == 'none' && options.skirtType != 'none') {
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
      if (options.waistbandStyle == 'none' && options.skirtType != 'none') {
        points.waistLeftNotch = points.topLeft.shift(-90, backPlacketLength)
        points.waistRightNotch = new Point(points.topRight.x, points.waistLeftNotch.y)
        macro('sprinkle', {
          snippet: 'notch',
          on: ['waistLeftNotch', 'waistRightNotch'],
        })
      }
      points.backLeftNotch = points.topLeft.shift(-90, backPlacketLength * 0.5)
      points.backRightNotch = new Point(points.topRight.x, points.backLeftNotch.y)
      macro('sprinkle', {
        snippet: 'bnotch',
        on: ['backLeftNotch', 'backRightNotch'],
      })
      //title
      points.title = new Point(points.topRight.x - placketWidth * 0.75, points.bottomLeft.y / 2)
      macro('title', {
        at: points.title,
        nr: '12',
        title: 'Placket',
        cutNr: 2,
        scale: 0.15,
      })
      //foldline
      if (options.placketStyle == 'separate') {
        if (options.placketFolded) {
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
        const buttonholeStart = absoluteOptions.buttonholeStart
        points.bodiceButtonholeStart = points.topRight.translate(
          -absoluteOptions.placketWidth * 0.5,
          buttonholeStart
        )
        if (options.waistbandStyle == 'none' && options.skirtType != 'none') {
          points.bodiceButtonholeEnd = points.bodiceButtonholeStart.shift(
            -90,
            backPlacketLength - buttonholeStart
          )
        } else {
          points.bodiceButtonholeEnd = points.bodiceButtonholeStart.shift(
            -90,
            backPlacketLength - buttonholeStart * 2
          )
        }
        for (let i = 0; i < options.bodiceButtonholeNum; i++) {
          points['bodiceButtonhole' + i] = points.bodiceButtonholeStart.shiftFractionTowards(
            points.bodiceButtonholeEnd,
            i / (options.bodiceButtonholeNum - 1)
          )
          snippets['bodiceButtonhole' + i] = new Snippet(
            'buttonhole',
            points['bodiceButtonhole' + i]
          ).attr('data-rotate', 90)
          snippets['bodiceButton' + i] = new Snippet('button', points['bodiceButtonhole' + i])
        }
        const buttonholeDist = points.bodiceButtonhole1.y - points.bodiceButtonhole0.y
        store.set('buttonholeDist', buttonholeDist)
        if (points.bodiceButtonholeEnd.y == backPlacketLength) {
          const skirtButtonholeNum = Math.floor((skirtLength - buttonholeStart) / buttonholeDist)
          points.skirtButtonholeEnd = points.bodiceButtonholeEnd.shift(
            -90,
            buttonholeDist * skirtButtonholeNum
          )
          for (let i = 0; i < skirtButtonholeNum; i++) {
            points['skirtButtonhole' + i] = points.bodiceButtonholeEnd.shiftFractionTowards(
              points.skirtButtonholeEnd,
              (i + 1) / skirtButtonholeNum
            )
            snippets['skirtButtonhole' + i] = new Snippet(
              'buttonhole',
              points['skirtButtonhole' + i]
            ).attr('data-rotate', 90)
            snippets['skirtButton' + i] = new Snippet('button', points['skirtButtonhole' + i])
          }
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
