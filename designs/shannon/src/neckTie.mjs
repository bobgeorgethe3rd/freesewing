import { pluginMirror } from '@freesewing/plugin-mirror'
import { front } from './front.mjs'

export const neckTie = {
  name: 'shannon.neckTie',
  after: front,
  plugins: [pluginMirror],
  options: {
    //Style
    neckTieLength: { pct: 32.8, min: 20, max: 40, menu: 'style' },
    neckTieCurve: { pct: 0, min: 0, max: 100, menu: 'style' },
    neckTieStyle: { dflt: 'straight', list: ['straight', 'curved'], menu: 'style' },
    neckTieFolded: { bool: true, menu: 'style' },
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
    //measures
    const neckTieWidth = store.get('neckTieWidth')
    const neckOpeningWidth = store.get('neckOpeningWidth')
    const neckTieLength = measurements.neck * options.neckTieLength + neckOpeningWidth
    //let's begin
    //let's begin
    points.topLeft = new Point(0, 0)
    points.bottomLeft = points.topLeft.shift(-90, neckTieWidth)
    points.topRight = points.topLeft.shift(0, neckTieLength)
    points.bottomRight = new Point(points.topRight.x, points.bottomLeft.y)

    points.curveStart = points.bottomRight.shift(180, neckTieWidth * 0.5 * options.neckTieCurve)
    points.curveEnd = points.curveStart.rotate(-90, points.bottomRight)
    if (options.neckTieStyle == 'straight') {
      points.curveStartCp2 = points.curveStart.shiftFractionTowards(points.curveEnd, 0.25)
      points.curveEndCp1 = points.curveEnd.shiftFractionTowards(points.curveStart, 0.25)
    } else {
      points.curveStartCp2 = points.curveStart.shiftFractionTowards(
        points.bottomRight,
        options.cpFraction
      )
      points.curveEndCp1 = points.curveEnd.shiftFractionTowards(
        points.bottomRight,
        options.cpFraction
      )
    }

    const flip = ['curveStart', 'curveStartCp2', 'curveEndCp1', 'curveEnd']
    for (const p of flip)
      points[p + 'F'] = points[p].flipY(points.topLeft.shiftFractionTowards(points.bottomLeft, 0.5))

    paths.saBase = new Path()
      .move(points.bottomLeft)
      .line(points.curveStart)
      .curve(points.curveStartCp2, points.curveEndCp1, points.curveEnd)
      .hide()

    paths.seamBase = paths.saBase
      .clone()
      .line(points.curveEndF)
      .curve(points.curveEndCp1F, points.curveStartCp2F, points.curveStartF)
      .hide()

    macro('mirror', {
      mirror: [points.topLeft, points.topRight],
      paths: ['saBase', 'seamBase'],
      prefix: 'm',
    })

    const drawSeam = () => {
      if (options.neckTieFolded)
        return paths.seamBase
          .join(paths.mSeamBase.reverse())
          .line(points.bottomLeft.flipY(points.topLeft))
      else return paths.seamBase.unhide()
    }

    paths.seam = drawSeam().clone().line(points.topLeft).line(points.bottomLeft).close()

    if (complete) {
      //grainline
      points.grainlineFrom = new Point(
        points.topLeft.shiftFractionTowards(points.topRight, 0.25).x,
        drawSeam().end().y
      )
      points.grainlineTo = new Point(points.grainlineFrom.x, points.bottomLeft.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      points.stitchlineTo = points.bottomLeft.shift(0, neckOpeningWidth)
      points.stitchlineFrom = new Point(points.stitchlineTo.x, drawSeam().end().y)
      points.topNotch = new Point(points.stitchlineTo.x, points.topLeft.y)
      snippets.topNotch = new Snippet('notch', points.topNotch)
      snippets.stitchlineTo = new Snippet('bnotch', points.stitchlineTo)
      if (options.neckTieFolded) {
        snippets.stitchlineFrom = new Snippet('bnotch', points.stitchlineFrom)
      }
      //title
      points.title = new Point(
        points.topLeft.shiftFractionTowards(points.topRight, 0.5).x,
        points.bottomLeft.y / 2
      )
      macro('title', {
        at: points.title,
        nr: '4',
        title: 'Neck Tie',
        scale: 0.15,
      })
      //foldline
      if (options.neckTieFolded) {
        paths.foldline = new Path()
          .move(points.topLeft)
          .line(points.curveStartF)
          .attr('class', 'various')
          .attr('data-text', 'Fold - Line')
          .attr('data-text-class', 'center')
      }
      //stitchline
      paths.stitchingLine = new Path()
        .move(points.stitchlineFrom)
        .line(points.stitchlineTo)
        .attr('class', 'fabric help')
        .attr('data-text', 'Stitching - Line')
        .attr('data-text-class', 'center')

      if (sa) {
        const drawSa = () => {
          if (options.neckTieFolded)
            return paths.saBase
              .join(paths.mSaBase.reverse())
              .line(points.bottomLeft.flipY(points.topLeft))
          else return paths.seamBase.line(points.topLeft).unhide()
        }

        paths.sa = drawSa().offset(sa).line(drawSa().start()).close().attr('class', 'fabric sa')
      }
    }

    return part
  },
}
