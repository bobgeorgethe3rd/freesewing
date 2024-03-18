import { back } from './back.mjs'
import { skirtFront } from './skirtFront.mjs'

export const placket = {
  name: 'rose.placket',
  after: skirtFront,
  from: back,
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
    log,
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
    //removing paths and snippets not required from Daisy
    const keepThese = ['placketNeck', 'mPlacketNeck']
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    for (let i in snippets) delete snippets[i]
    //measures
    const skirtLength = store.get('skirtLength')
    //remove macros
    macro('title', false)
    macro('scalebox', false)
    //let's begin
    if (options.waistbandStyle == 'none' && options.skirtBool) {
      points.bottomRight = points.bodicePlacketWaistRight.shift(-90, skirtLength)
    } else {
      points.bottomRight = points.bodicePlacketWaistRight
    }
    if (options.placketStyle == 'separate' && options.placketFolded) {
      points.bottomLeft = new Point(points.mBodicePlacketNeckRight.x, points.bottomRight.y)
    } else {
      points.bottomLeft = new Point(points.bodicePlacketNeckLeft.x, points.bottomRight.y)
    }
    //paths
    const drawNeck = () => {
      if (options.placketStyle == 'separate' && options.placketFolded) {
        return paths.placketNeck.join(paths.mPlacketNeck.reverse())
      } else {
        return paths.placketNeck
      }
    }
    paths.seam = new Path()
      .move(points.bottomLeft)
      .line(points.bottomRight)
      .line(points.bodicePlacketNeckRight)
      .join(drawNeck())
      .line(points.bottomLeft)
      .close()

    if (complete) {
      //grainline
      points.grainlineFrom = new Point(
        points.bodicePlacketNeckLeft.x * 0.5,
        points.bodicePlacketNeckLeft.y
      )
      points.grainlineTo = new Point(points.grainlineFrom.x, points.bottomLeft.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      snippets.bodicePlacketArmholeRight = new Snippet('bnotch', points.bodicePlacketArmholeRight)
      if (options.placketStyle == 'separate' && options.placketFolded) {
        snippets.armholeLeftNotch = new Snippet('bnotch', points.mBodicePlacketArmholeRight)
      } else {
        snippets.armholeLeftNotch = new Snippet('bnotch', points.bodicePlacketArmholeLeft)
      }
      if (options.waistbandStyle == 'none' && options.skirtBool) {
        snippets.bodicePlacketWaistRight = new Snippet('notch', points.bodicePlacketWaistRight)
        if (options.placketStyle == 'separate' && options.placketFolded) {
          snippets.waistLeftNotch = new Snippet('notch', points.mBodicePlacketWaistRight)
        } else {
          snippets.waistLeftNotch = new Snippet('notch', points.bodicePlacketWaistLeft)
        }
      }
      //title
      points.title = new Point(points.bodicePlacketNeckRight.x * 0.5, points.bottomLeft.y / 2)
      macro('title', {
        at: points.title,
        nr: '14',
        title: 'Placket',
        scale: 0.15,
      })
      //foldlines
      if (options.placketStyle == 'separate') {
        if (options.placketFolded) {
          points.foldlineFrom = points.bodicePlacketNeckLeft
          points.foldlineTo = new Point(points.bodicePlacketNeckLeft.x, points.bottomLeft.y)
          paths.foldLine = new Path()
            .move(points.foldlineFrom)
            .line(points.foldlineTo)
            .attr('class', 'mark')
            .attr('data-text', 'Fold - Line')
            .attr('data-text-class', 'center')
        }
        //buttons & buttonholes
        if (options.waistbandStyle == 'none' && options.skirtBool) {
          points.bodiceButtonholeEnd = points.cbWaist
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
        if (points.bodiceButtonholeEnd.y == points.cbWaist.y) {
          const skirtButtonholeNum = Math.floor(
            (skirtLength - absoluteOptions.buttonholeStart) / buttonholeDist
          )
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
        const neckSa = sa * options.neckSaWidth * 100
        points.saBottomLeft = points.bottomLeft.translate(-sa, sa)
        points.saBottomRight = points.bottomRight.translate(sa, sa)
        points.saBodicePlacketNeckRight = new Point(
          points.saBottomRight.x,
          paths.placketNeck.offset(neckSa).start().y
        )
        points.saTopLeft = new Point(points.saBottomLeft.x, drawNeck().offset(neckSa).end().y)

        paths.sa = new Path()
          .move(points.saBottomLeft)
          .line(points.saBottomRight)
          .line(points.saBodicePlacketNeckRight)
          .join(drawNeck().offset(neckSa))
          .line(points.saTopLeft)
          .line(points.saBottomLeft)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
