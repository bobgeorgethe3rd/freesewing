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

    points.frontPlacketCurveStartCp2 = points.frontPlacketCurveStart.shift(
      0,
      frontPlacketWidth * options.frontPlacketCurve * options.cpFraction
    )
    points.frontPlacketCurveEndCp1 = points.frontPlacketCurveEnd.shift(
      -90,
      frontPlacketWidth * options.frontPlacketCurve * options.cpFraction
    )

    const drawSaBottom = () => {
      if (options.frontPlacketStyle == 'curved')
        return new Path()
          .move(points.frontPlacketCurveStart)
          .curve(
            points.frontPlacketCurveStartCp2,
            points.frontPlacketCurveEndCp1,
            points.frontPlacketCurveEnd
          )
          .line(points.frontPlacketNeck)
      else return new Path().move(points.frontPlacketCurveStart).line(points.frontPlacketCurveEnd)
    }

    paths.saBottom = drawSaBottom().line(points.frontPlacketNeck).hide()

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
      paths: ['saBottom', 'cfNeck', 'stitchingGuide'],
      prefix: 'm',
    })

    paths.seam = paths.mSaBottom
      .reverse()
      .line(points.frontPlacketCurveStart)
      .join(paths.saBottom)
      .line(points.frontPlacketNeck)
      .join(paths.cfNeck)
      .join(paths.mCfNeck.reverse())
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
        cutNr: 1,
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

        points.saFrontPlacketNeck = new Point(
          points.frontPlacketNeck.x + sa,
          paths.cfNeck.offset(neckSa).start().y
        )
        points.saBottomCorner = new Point(
          points.frontPlacketBottomRight.x + sa,
          points.frontPlacketBottom.y + sa
        )

        const flip = ['saBottomCorner', 'saFrontPlacketNeck']
        for (const p of flip) points[p + 'F'] = points[p].flipX(points.cfNeck)

        if (options.frontPlacketCurve > 0) {
          points.saFrontPlacketCurveStart = utils.beamIntersectsY(
            points.frontPlacketCurveStart
              .shiftTowards(points.frontPlacketCurveEnd, sa)
              .rotate(-90, points.frontPlacketCurveStart),
            points.frontPlacketCurveEnd
              .shiftTowards(points.frontPlacketCurveStart, sa)
              .rotate(90, points.frontPlacketCurveEnd),
            points.frontPlacketBottom.y + sa
          )
          points.saFrontPlacketCurveEnd = utils.beamIntersectsX(
            points.frontPlacketCurveStart
              .shiftTowards(points.frontPlacketCurveEnd, sa)
              .rotate(-90, points.frontPlacketCurveStart),
            points.frontPlacketCurveEnd
              .shiftTowards(points.frontPlacketCurveStart, sa)
              .rotate(90, points.frontPlacketCurveEnd),
            points.frontPlacketCurveEnd.x + sa
          )
          points.saFrontPlacketBottom = utils.beamIntersectsX(
            points.frontPlacketCurveStart
              .shiftTowards(points.frontPlacketCurveEnd, sa)
              .rotate(-90, points.frontPlacketCurveStart),
            points.frontPlacketCurveEnd
              .shiftTowards(points.frontPlacketCurveStart, sa)
              .rotate(90, points.frontPlacketCurveEnd),
            points.frontPlacketBottom.x
          )
          const flip = ['saFrontPlacketCurveStart', 'saFrontPlacketCurveEnd']
          for (const p of flip) points[p + 'F'] = points[p].flipX(points.cfNeck)
        }

        const drawSaBase = () => {
          if (options.frontPlacketCurve == 0) {
            return new Path()
              .move(points.saFrontPlacketNeckF)
              .line(points.saBottomCornerF)
              .line(points.saBottomCorner)
              .line(points.saFrontPlacketNeck)
          } else {
            if (options.frontPlacketStyle == 'curved') {
              return paths.mSaBottom.reverse().join(paths.saBottom).offset(sa)
            } else {
              if (options.frontPlacketCurve == 1) {
                return new Path()
                  .move(points.saFrontPlacketNeckF)
                  .line(points.saFrontPlacketCurveEndF)
                  .line(points.saFrontPlacketCurveStartF)
                  .line(points.saFrontPlacketBottom)
                  .line(points.saFrontPlacketCurveStart)
                  .line(points.saFrontPlacketCurveEnd)
                  .line(points.saFrontPlacketNeck)
              } else {
                return new Path()
                  .move(points.saFrontPlacketNeckF)
                  .line(points.saFrontPlacketCurveEndF)
                  .line(points.saFrontPlacketCurveStartF)
                  .line(points.saFrontPlacketCurveStart)
                  .line(points.saFrontPlacketCurveEnd)
                  .line(points.saFrontPlacketNeck)
              }
            }
          }
        }
        paths.sa = drawSaBase()
          .join(paths.cfNeck.offset(neckSa))
          .join(paths.mCfNeck.reverse().offset(neckSa))
          .line(points.saFrontPlacketNeckF)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
