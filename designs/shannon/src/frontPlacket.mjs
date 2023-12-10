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

    paths.saRight = new Path()
      .move(points.cfChest)
      .line(points.frontPlacketCurveStart)
      .curve(
        points.frontPlacketCurveStartCp2,
        points.frontPlacketCurveEndCp1,
        points.frontPlacketCurveEnd
      )
      .line(points.frontPlacketNeck)

    paths.cfNeck = new Path()
      .move(points.hps)
      .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
      .split(points.frontPlacketNeck)[1]

    paths.stitchingGuide = new Path()
      .move(points.neckOpening)
      .line(points.neckOpeningBottom)
      .curve(points.neckOpeningBottomCp2, points.cfNeckOpeningCp1, points.cfNeckOpening)

    if (complete) {
      // .attr('class', 'fabric help')
      // .attr('data-text', 'Stitching - Line')
      // .attr('data-text-class', 'center')
    }

    return part
  },
}
