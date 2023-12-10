import { pluginMirror } from '@freesewing/plugin-mirror'
import { front } from './front.mjs'

export const frontPlacket = {
  name: 'shannon.frontPlacket',
  from: front,
  plugins: [pluginMirror],
  options: {
    //Style
    frontPlacketCurve: { pct: 100, min: 0, max: 100, menu: 'plackets' },
    frontPlacketStyle: { dflt: 'straight', list: ['straight', 'curved'], menu: 'plackets' },
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
    //remove paths & snippets
    for (let i in paths) delete paths[i]
    for (let i in snippets) delete snippets[i]
    //removing macros not required from Bella
    macro('title', false)
    //measures
    const frontPlacketWidth = store.get('frontPlacketWidth')
    //let's begin
    points.frontPlacketBottomRight = points.frontPlacketBottom.translate(
      frontPlacketWidth,
      -frontPlacketWidth
    )
    points.frontPlacketNeck = utils.lineIntersectsCurve(
      points.frontPlacketBottomRight,
      new Point(points.frontPlacketBottomRight.x, points.hps.y),
      points.hps,
      points.hpsCp2,
      points.cfNeckCp1,
      points.cfNeck
    )
    points.frontPlacketCurveStart = points.frontPlacketBottom.shift(
      0,
      frontPlacketWidth * (1 - options.frontPlacketCurve)
    )
    points.frontPlacketCurveEnd = points.frontPlacketBottomRight.shift(
      -90,
      frontPlacketWidth * (1 - options.frontPlacketCurve)
    )
    if (options.frontPlacketStyle == 'curved') {
      points.frontPlacketCurveStartCp2 = points.frontPlacketCurveStart.shift(
        0,
        frontPlacketWidth * options.frontPlacketCurve * options.cpFraction
      )
      points.frontPlacketCurveEndCp1 = points.frontPlacketCurveEnd.shift(
        -90,
        frontPlacketWidth * options.frontPlacketCurve * options.cpFraction
      )
    } else {
      points.frontPlacketCurveStartCp2 = points.frontPlacketCurveStart.shiftFractionTowards(
        points.frontPlacketCurveEnd,
        options.cpFraction
      )
      points.frontPlacketCurveEndCp1 = points.frontPlacketCurveEnd.shiftFractionTowards(
        points.frontPlacketCurveStart,
        options.cpFraction
      )
    }

    paths.saBase = new Path()
      .move(points.frontPlacketCurveStart)
      .curve(
        points.frontPlacketCurveStartCp2,
        points.frontPlacketCurveEndCp1,
        points.frontPlacketCurveEnd
      )
      .hide()

    paths.cfNeck = new Path()
      .move(points.hps)
      .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
      .split(points.frontPlacketNeck)[1]
      .hide()

    paths.stitchingGuide = new Path()
      .move(points.neckOpening)
      .line(points.neckOpeningBottom)
      .curve(points.neckOpeningBottomCp2, points.cfNeckOpeningCp1, points.cfNeckOpening)
      .hide()

    macro('mirror', {
      mirror: [points.cfNeck, points.cfChest],
      paths: ['saBase', 'cfNeck', 'stitchingGuide'],
      prefix: 'm',
    })

    paths.seam = paths.mSaBase
      .reverse()
      .line(points.frontPlacketCurveStart)
      .join(paths.saBase)
      .line(points.frontPlacketNeck)
      .join(paths.cfNeck)
      .join(paths.mCfNeck.reverse())
      .line(paths.mSaBase.end())
      .close()

    if (complete) {
      //grainline
      points.grainlineFrom = points.cfNeckCp1.flipX(points.cfNeck)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.frontPlacketCurveEnd.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      const flip = ['neckTieTop0', 'neckTieTop1', 'neckTieBottom0', 'neckTieBottom1']
      for (const p of flip) points[p + 'F'] = points[p].flipX(points.cfNeck)
      macro('sprinkle', {
        snippet: 'notch',
        on: ['neckTieTop0', 'neckTieTop1', 'neckTieTop0F', 'neckTieTop1F'],
      })
      macro('sprinkle', {
        snippet: 'bnotch',
        on: ['neckTieBottom0', 'neckTieBottom1', 'neckTieBottom0F', 'neckTieBottom1F'],
      })
      //title
      points.title = new Point(points.cfNeckCp1.x / 2, points.cfChest.y / 2)
      macro('title', {
        at: points.title,
        nr: '3',
        title: 'Front Placket',
        scale: 1 / 3,
      })
      //stitchingGuide
      paths.stitchingGuide = paths.stitchingGuide
        .join(paths.mStitchingGuide.reverse())
        .attr('class', 'fabric help')
        .attr('data-text', 'Stitching - Line')
        .attr('data-text-class', 'center')

      if (sa) {
        const neckSa = sa * options.neckSaWidth * 100

        if (options.frontPlacketCurve > 0.01) {
          if (options.frontPlacketStyle == 'straight') {
            points.saFrontPlacketCurveStart = utils.beamIntersectsY(
              points.frontPlacketCurveStart
                .shiftTowards(points.frontPlacketCurveStartCp2, sa)
                .rotate(-90, points.frontPlacketCurveStart),
              points.frontPlacketCurveStartCp2
                .shiftTowards(points.frontPlacketCurveStart, sa)
                .rotate(90, points.frontPlacketCurveStartCp2),
              points.frontPlacketBottom.y + sa
            )
            points.saFrontPlacketCurveEnd = utils.beamIntersectsX(
              points.frontPlacketCurveEndCp1
                .shiftTowards(points.frontPlacketCurveEnd, sa)
                .rotate(-90, points.frontPlacketCurveEndCp1),
              points.frontPlacketCurveEnd
                .shiftTowards(points.frontPlacketCurveEndCp1, sa)
                .rotate(90, points.frontPlacketCurveEnd),
              points.frontPlacketNeck.x + sa
            )
          } else {
            points.saFrontPlacketCurveStart = paths.saBase.offset(sa).start()
            points.saFrontPlacketCurveEnd = paths.saBase.offset(sa).end()
          }
        } else {
          points.saFrontPlacketCurveStart = points.frontPlacketCurveStart.translate(sa, sa)
          points.saFrontPlacketCurveEnd = points.saFrontPlacketCurveStart
        }
        points.saFrontPlacketNeck = new Point(
          points.saFrontPlacketCurveEnd.x,
          paths.cfNeck.offset(neckSa).start().y
        )

        if (options.frontPlacketCurve == 1) {
          points.saCfChest = utils.beamIntersectsX(
            points.frontPlacketCurveStart
              .shiftTowards(points.frontPlacketCurveStartCp2, sa)
              .rotate(-90, points.frontPlacketCurveStart),
            points.frontPlacketCurveStartCp2
              .shiftTowards(points.frontPlacketCurveStart, sa)
              .rotate(90, points.frontPlacketCurveStartCp2),
            points.cfChest.x
          )
        } else {
          points.saCfChest = points.cfChest.shift(-90, sa)
        }

        const flip = ['saFrontPlacketCurveStart', 'saFrontPlacketCurveEnd', 'saFrontPlacketNeck']
        for (const p of flip) points[p + 'F'] = points[p].flipX(points.cfNeck)

        const drawSaBottom = () => {
          if (options.frontPlacketCurve <= '0.01') {
            return new Path()
              .move(points.saFrontPlacketCurveEndF)
              .line(points.saFrontPlacketCurveStartF)
              .line(points.saCfChest)
              .line(points.saFrontPlacketCurveStart)
              .line(points.saFrontPlacketCurveEnd)
          } else {
            return new Path()
              .move(points.saFrontPlacketCurveEndF)
              .join(paths.mSaBase.reverse().offset(sa))
              .line(points.saFrontPlacketCurveStartF)
              .line(points.saCfChest)
              .line(points.saFrontPlacketCurveStart)
              .join(paths.saBase.offset(sa))
              .line(points.saFrontPlacketCurveEnd)
          }
        }

        paths.sa = drawSaBottom()
          .line(points.saFrontPlacketNeck)
          .join(paths.cfNeck.offset(neckSa))
          .join(paths.mCfNeck.reverse().offset(neckSa))
          .line(points.saFrontPlacketNeckF)
          .line(points.saFrontPlacketCurveEndF)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
