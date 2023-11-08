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
    closureSaWidth: { pct: 1.5, min: 1, max: 3, menu: 'construction' },
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
    let keepThese = 'daisyGuide'
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    //measurements
    const placketWidth = store.get('placketWidth')
    //let's begin
    //paths
    paths.waist = new Path().move(points.waistLeft).line(points.dartBottomLeft).hide()

    paths.styleLine = new Path()
      .move(points.dartBottomLeft)
      .curve(points.dartBottomLeftCp2, points.neckBackCornerCp, points.neckBackCorner)
      .hide()

    paths.seam = paths.waist
      .join(paths.styleLine)
      .line(points.neckBack)
      .line(points.waistLeft)
      .close()

    if (complete) {
      //grainline
      points.grainlineTo = points.cbWaist
        .shift(0, placketWidth * 0.5)
        .shiftFractionTowards(points.dartBottomLeft, 0.15)
      points.grainlineFrom = new Point(points.grainlineTo.x, points.cbTop.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      points.backNotch = points.waistLeft.shiftFractionTowards(points.neckBack, 0.5)
      points.styleNotch = paths.styleLine.shiftFractionAlong(0.5)
      macro('sprinkle', {
        snippet: 'bnotch',
        on: ['backNotch', 'styleNotch', 'neckBackCorner'],
      })
      //title
      points.title = new Point(
        (placketWidth * 0.5 + points.dartBottomLeft.x) * 0.5,
        (points.cbTop.y + points.cbWaist.y) * 0.5
      )
      macro('title', {
        at: points.title,
        nr: '4',
        title: 'back',
        scale: 0.5,
      })
      //lines
      if (options.placketStyle == 'inbuilt' || options.placketStyle == 'facing') {
        paths.stitchingLine = new Path()
          .move(points.cbTop.shift(0, placketWidth * 0.5))
          .line(points.cbWaist.shift(0, placketWidth * 0.5))
          .attr('class', 'mark')
          .attr('data-text', 'Stitching - Line')
          .attr('data-text-class', 'center')
      }
      if (options.placketStyle == 'inbuilt') {
        paths.foldLine = new Path()
          .move(points.cbTop.shift(180, placketWidth * 0.5))
          .line(points.cbWaist.shift(180, placketWidth * 0.5))
          .attr('class', 'mark')
          .attr('data-text', 'Fold - Line')
          .attr('data-text-class', 'center')
      }
      if (sa) {
        let backSa
        if (options.placketStyle == 'zipper') {
          backSa = sa * options.closureSaWidth * 100
        } else {
          backSa = sa
        }

        const styleLineSa = sa * options.styleLineSaWidth * 100
        points.saDartBottomLeft = points.dartBottomLeft.translate(styleLineSa, sa)
        points.saNeckBackCorner = points.neckBackCorner.translate(styleLineSa, -sa)
        points.saNeckBack = points.neckBack.translate(-backSa, -sa)
        points.saWaistLeft = points.waistLeft.translate(-backSa, sa)

        paths.sa = paths.waist
          .offset(sa)
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
