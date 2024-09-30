import { sleeve } from './sleeve.mjs'
import { pluginMirror } from '@freesewing/plugin-mirror'

export const band = {
  name: 'simpleshirtsleeve.band',
  after: sleeve,
  options: {
    //Constants
    cpFraction: 0.55191502449,
    //Sleeves
    sleeveBandFolded: { bool: true, menu: 'sleeves' },
    sleeveBandType: { dflt: 'straight', list: ['straight', 'curved'], menu: 'sleeves' },
    sleeveBandCurve: { pct: 0, min: 0, max: 100, menu: 'sleeves' },
  },
  plugins: [pluginMirror],
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
    //render
    if (options.sleeveHemStyle != 'band') {
      part.hide()
      return part
    }
    //measures
    const bandWidth = absoluteOptions.sleeveBandWidth
    const bandLength = store.get('sleeveBandLength')
    //let's begin
    points.topLeft = new Point(0, 0)
    points.bottomLeftCorner = points.topLeft.shift(-90, bandWidth)
    points.bottomRightCorner = points.bottomLeftCorner.shift(0, bandLength)
    points.topRight = new Point(points.bottomRightCorner.x, points.topLeft.y)
    points.bottomLeft = points.bottomLeftCorner.shift(0, bandWidth / 2)
    points.bottomRight = points.bottomRightCorner.shift(180, bandWidth / 2)
    //curves
    points.leftEnd = points.bottomLeftCorner.shiftFractionTowards(
      points.bottomLeft,
      options.sleeveBandCurve
    )
    points.leftCp2 = points.leftEnd.shiftFractionTowards(
      points.bottomLeftCorner,
      options.cpFraction
    )
    points.leftCp1 = points.leftCp2.rotate(90, points.bottomLeftCorner)
    points.leftStart = points.leftEnd.rotate(90, points.bottomLeftCorner)
    points.rightStart = points.bottomRightCorner.shiftFractionTowards(
      points.bottomRight,
      options.sleeveBandCurve
    )
    points.rightCp1 = points.rightStart.shiftFractionTowards(
      points.bottomRightCorner,
      options.cpFraction
    )
    points.rightCp2 = points.rightCp1.rotate(-90, points.bottomRightCorner)
    points.rightEnd = points.rightStart.rotate(-90, points.bottomRightCorner)
    //guides
    // paths.scaffold = new Path()
    // .move(points.topLeft)
    // .line(points.bottomLeftCorner)
    // .line(points.bottomRightCorner)
    // .line(points.topRight)
    // .line(points.topLeft)
    // .close()
    //paths
    const drawSaBase = () => {
      if (options.sleeveBandType == 'curved') {
        return new Path()
          .move(points.rightStart)
          .curve(points.rightCp1, points.rightCp2, points.rightEnd)
          .line(points.topRight)
          .line(points.topLeft)
          .line(points.leftStart)
          .curve(points.leftCp1, points.leftCp2, points.leftEnd)
      } else {
        return new Path()
          .move(points.rightStart)
          .line(points.rightEnd)
          .line(points.topRight)
          .line(points.topLeft)
          .line(points.leftStart)
          .line(points.leftEnd)
      }
    }

    paths.saBase = drawSaBase().hide()

    macro('mirror', {
      mirror: [points.bottomLeftCorner, points.bottomRightCorner],
      paths: ['saBase'],
      prefix: 'm',
    })

    const drawSaBottom = () => {
      if (options.sleeveBandFolded) {
        return paths.mSaBase
      } else {
        return new Path().move(points.leftEnd).move(points.rightStart)
      }
    }

    paths.seam = paths.saBase.join(drawSaBottom().reverse()).close()

    if (complete) {
      //grainline
      points.grainlineFrom = points.topLeft.shiftFractionTowards(points.topRight, 0.5)
      points.grainlineTo = new Point(points.grainlineFrom.x, drawSaBottom().edge('bottom').y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //title
      let titleCutNum = 2
      if (options.sleeveBandFolded) titleCutNum = 1
      points.title = points.topLeft.translate(bandLength / 4, drawSaBottom().edge('bottom').y / 2)
      macro('title', {
        at: points.title,
        nr: '2',
        title: 'Band (Sleeve)',
        cutNr: titleCutNum,
        scale: 0.25,
      })

      if (sa) {
        if (options.sleeveBandFolded) {
          paths.sa = new Path()
            .move(points.topLeft)
            .line(points.topLeft.shift(-90, bandWidth * 2))
            .line(points.topRight.shift(-90, bandWidth * 2))
            .line(points.topRight)
            .line(points.topLeft)
            .offset(sa)
            .close()
            .attr('class', 'fabric sa')
        } else {
          paths.sa = paths.seam.offset(sa).close().attr('class', 'fabric sa')
        }
      }
    }

    return part
  },
}
