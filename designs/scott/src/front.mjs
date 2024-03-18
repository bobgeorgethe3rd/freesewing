import { frontBase } from './frontBase.mjs'
import { pluginLogoRG } from '@freesewing/plugin-logorg'

export const front = {
  name: 'scott.front',
  from: frontBase,
  hide: {
    from: true,
    inherited: true,
  },
  plugins: [pluginLogoRG],
  options: {
    //Construction
    styleLineSaWidth: { pct: 1, min: 1, max: 3, menu: 'construction' },
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
  }) => {
    //removing paths and snippets not required from Bella
    const keepThese = 'daisyGuide'
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    //let's begin
    //paths
    paths.styleLine = new Path()
      .move(points.waistDartLeft)
      .curve(points.waistDartLeftCp2, points.neckFrontCp1, points.neckFront)
      .hide()

    paths.neck = new Path()
      .move(points.neckFront)
      ._curve(points.heartPeakCp1, points.heartPeak)
      .curve_(points.heartPeakCp2, points.cfTop)
      .hide()

    paths.seam = new Path()
      .move(points.cfWaist)
      .line(points.waistDartLeft)
      .join(paths.styleLine)
      .join(paths.neck)
      .line(points.cfWaist)
      .close()

    if (complete) {
      //grainline
      if (options.closurePosition != 'front' && options.cfSaWidth == 0) {
        points.cutOnFoldFrom = points.cfTop
        points.cutOnFoldTo = points.cfWaist
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
      } else {
        points.grainlineTo = points.cfWaist.shiftFractionTowards(points.waistDartLeft, 0.15)
        points.grainlineFrom = new Point(points.grainlineTo.x, points.cfTop.y)
        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
      }
      //notches
      points.bustNotch = utils.lineIntersectsCurve(
        points.bust,
        points.cfChest,
        points.waistDartLeft,
        points.waistDartLeftCp2,
        points.neckFrontCp1,
        points.neckFront
      )
      macro('sprinkle', {
        snippet: 'notch',
        on: ['cfTop', 'cfChest', 'bustNotch', 'neckFront'],
      })
      //title
      macro('title', {
        at: points.title,
        nr: '1',
        title: 'Front',
        scale: 2 / 3,
      })
      //logo
      points.logo = new Point(points.heartPeak.x, (points.bust.y + points.cfWaist.y) * 0.5)
      macro('logorg', {
        at: points.logo,
        scale: 0.4,
      })
      if (sa) {
        const styleLineSa = sa * options.styleLineSaWidth * 100
        let cfSa
        if (options.closurePosition == 'front') {
          cfSa = sa * options.closureSaWidth * 100
        } else {
          cfSa = sa * options.cfSaWidth * 100
        }

        points.saWaistDartLeft = points.waistDartLeft.translate(styleLineSa, sa)
        points.saCfTop = points.cfTop.shift(180, cfSa)

        paths.sa = new Path()
          .move(points.saCfWaist)
          .line(points.saWaistDartLeft)
          .join(paths.styleLine.offset(styleLineSa))
          .join(paths.neck.offset(sa))
          .line(points.saCfTop)
          .line(points.saCfWaist)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
