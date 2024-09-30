import { pctBasedOn } from '@freesewing/core'
import { backBase } from './backBase.mjs'
import { front } from './front.mjs'

export const back = {
  name: 'scott.back',
  from: backBase,
  after: front,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Plackets
    buttonholeStart: {
      pct: 3.2,
      min: 3,
      max: 5,
      snap: 3.175,
      ...pctBasedOn('hpsToWaistBack'),
      menu: 'plackets',
    },
    bodiceButtonholeNum: { count: 5, min: 3, max: 10, menu: 'plackets' },
    //Constructin
    closureSaWidth: { pct: 1.5, min: 1, max: 3, menu: 'construction' },
    cbSaWidth: { pct: 0, min: 0, max: 3, menu: 'construction' },
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
    //removing paths and snippets not required from Bella
    const keepThese = 'daisyGuide'
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    //measurements
    const placketWidth = store.get('placketWidth')
    //let's begin
    //paths
    paths.styleLine = new Path()
      .move(points.dartBottomLeft)
      .curve(points.dartBottomLeftCp2, points.neckBackCornerCp, points.neckBackCorner)
      .hide()

    paths.seam = new Path()
      .move(points.waistLeft)
      .line(points.dartBottomLeft)
      .join(paths.styleLine)
      .line(points.neckBack)
      .line(points.waistLeft)
      .close()

    if (complete) {
      //grainline
      let titleCutNum
      if (options.closurePosition != 'back' && options.cfSaWidth == 0) {
        points.cutOnFoldFrom = points.cbTop
        points.cutOnFoldTo = points.cbWaist
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
        titleCutNum = 1
      } else {
        points.grainlineTo = points.cbWaist.shiftFractionTowards(points.dartBottomLeft, 1 / 3)
        points.grainlineFrom = new Point(points.grainlineTo.x, points.cbTop.y)
        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
        titleCutNum = 2
      }
      //notches
      points.backNotch = points.waistLeft.shiftFractionTowards(points.neckBack, 0.5)
      points.styleNotch = paths.styleLine.shiftFractionAlong(0.5)
      macro('sprinkle', {
        snippet: 'bnotch',
        on: ['backNotch', 'styleNotch', 'neckBackCorner'],
      })
      //title
      points.title = new Point(
        points.dartBottomLeft.x * 0.5,
        (points.cbTop.y + points.cbWaist.y) * 0.5
      )
      macro('title', {
        at: points.title,
        nr: '4',
        title: 'back',
        cutNr: titleCutNum,
        scale: 0.5,
      })
      //lines and buttonholes
      if (options.closurePosition == 'back') {
        if (options.placketStyle == 'inbuilt' || options.placketStyle == 'facing') {
          paths.stitchingLine = new Path()
            .move(points.cbTop.shift(0, placketWidth * 0.5))
            .line(points.cbWaist.shift(0, placketWidth * 0.5))
            .attr('class', 'mark')
            .attr('data-text', 'Stitching - Line')
            .attr('data-text-class', 'center')

          points.buttonholeStart = points.cbTop.shiftTowards(
            points.cbWaist,
            absoluteOptions.buttonholeStart
          )
          points.buttonholeEnd = points.cbWaist.shiftTowards(
            points.cbTop,
            absoluteOptions.buttonholeStart
          )
          for (let i = 0; i < options.bodiceButtonholeNum; i++) {
            points['buttonhole' + i] = points.buttonholeStart.shiftFractionTowards(
              points.buttonholeEnd,
              i / (options.bodiceButtonholeNum - 1)
            )
            snippets['buttonhole' + i] = new Snippet('buttonhole', points['buttonhole' + i]).attr(
              'data-rotate',
              90
            )
            snippets['button' + i] = new Snippet('button', points['buttonhole' + i])
          }
          store.set('buttonholeDist', points.buttonhole1.y - points.buttonhole0.y)
        }
        if (options.placketStyle == 'inbuilt') {
          paths.foldLine = new Path()
            .move(points.cbTop.shift(180, placketWidth * 0.5))
            .line(points.cbWaist.shift(180, placketWidth * 0.5))
            .attr('class', 'mark')
            .attr('data-text', 'Fold - Line')
            .attr('data-text-class', 'center')
        }
      }
      if (sa) {
        let backSa
        if (options.placketStyle == 'none') {
          backSa = sa * options.closureSaWidth * 100
        } else {
          if (options.closurePosition == 'back') {
            backSa = sa
          } else {
            backSa = sa * options.cbSaWidth * 100
          }
        }

        const styleLineSa = sa * options.styleLineSaWidth * 100
        points.saDartBottomLeft = points.dartBottomLeft.translate(styleLineSa, sa)
        points.saNeckBackCorner = points.neckBackCorner.translate(styleLineSa, -sa)
        points.saNeckBack = points.neckBack.translate(-backSa, -sa)
        points.saWaistLeft = points.waistLeft.translate(-backSa, sa)

        paths.sa = new Path()
          .move(points.saWaistLeft)
          .line(points.saDartBottomLeft)
          .join(paths.styleLine.offset(styleLineSa))
          .line(points.saNeckBackCorner)
          .line(points.saNeckBack)
          .line(points.saWaistLeft)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
