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
    points.topLeft = new Point(0, 0)
    points.bottomLeft = points.topLeft.shift(-90, neckTieWidth)
    points.topRight = points.topLeft.shift(0, neckTieLength)
    points.bottomRight = new Point(points.topRight.x, points.bottomLeft.y)

    points.curveStart = points.bottomRight.shift(180, neckTieWidth * 0.5 * options.neckTieCurve)
    points.curveEnd = points.curveStart.rotate(-90, points.bottomRight)

    points.curveStartCp2 = points.curveStart.shiftFractionTowards(
      points.bottomRight,
      options.cpFraction
    )
    points.curveEndCp1 = points.curveEnd.shiftFractionTowards(
      points.bottomRight,
      options.cpFraction
    )

    const flip = ['curveStart', 'curveStartCp2', 'curveEndCp1', 'curveEnd']
    for (const p of flip)
      points[p + 'F'] = points[p].flipY(points.topLeft.shiftFractionTowards(points.bottomLeft, 0.5))

    const drawSaBase = () => {
      if (options.neckTieStyle == 'curved')
        return new Path()
          .line(points.curveStart)
          .curve(points.curveStartCp2, points.curveEndCp1, points.curveEnd)
      else return new Path().line(points.curveStart).line(points.curveEnd)
    }

    paths.saBase = new Path().move(points.bottomLeft).join(drawSaBase()).hide()

    const drawSeamBase = () => {
      if (options.neckTieStyle == 'curved')
        return new Path()
          .line(points.curveEndF)
          .curve(points.curveEndCp1F, points.curveStartCp2F, points.curveStartF)
      else return new Path().move(points.curveEndF).line(points.curveStartF)
    }

    paths.seamBase = paths.saBase.clone().join(drawSeamBase()).hide()

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
      let titleCutNum = 4
      if (options.neckTieFolded) {
        snippets.stitchlineFrom = new Snippet('bnotch', points.stitchlineFrom)
        titleCutNum *= 2
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
        cutNr: titleCutNum,
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
        points.saBottomLeft = points.bottomLeft.shift(-90, sa)
        points.saBottomRight = points.bottomRight.translate(sa, sa)

        if (options.neckTieCurve > 0) {
          points.saCurveStart = utils.beamIntersectsY(
            points.curveStart.shiftTowards(points.curveEnd, sa).rotate(-90, points.curveStart),
            points.curveEnd.shiftTowards(points.curveStart, sa).rotate(90, points.curveEnd),
            points.curveStart.y + sa
          )
          if (options.neckTieStyle == 'straight') {
            points.saCurveEnd = utils.beamIntersectsY(
              points.curveStart.shiftTowards(points.curveEnd, sa).rotate(-90, points.curveStart),
              points.curveEnd.shiftTowards(points.curveStart, sa).rotate(90, points.curveEnd),
              points.curveEnd.y
            )
          } else {
            points.saCurveEnd = points.curveEnd.shift(0, sa)
          }
        }

        const drawSa = () => {
          if (options.neckTieCurve == 0)
            return new Path().move(points.saBottomLeft).line(points.saBottomRight)
          else {
            if (options.neckTieStyle == 'curved') {
              return paths.saBase.offset(sa).line(points.saCurveEnd)
            } else {
              return new Path()
                .move(points.saBottomLeft)
                .line(points.saCurveStart)
                .line(points.saCurveEnd)
            }
          }
        }

        paths.drawSa = drawSa().hide()

        let mirrorAnchor
        if (options.neckTieFolded) {
          mirrorAnchor = points.topLeft
        } else {
          mirrorAnchor = points.bottomLeft.shiftFractionTowards(points.topLeft, 0.5)
        }

        macro('mirror', {
          mirror: [mirrorAnchor, mirrorAnchor.shift(0, 1)],
          paths: ['drawSa'],
          prefix: 'm',
        })

        paths.sa = drawSa()
          .line(paths.mDrawSa.end())
          .join(paths.mDrawSa.reverse())
          .line(points.saBottomLeft)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
