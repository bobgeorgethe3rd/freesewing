import { front } from './front.mjs'

export const frontPlacket = {
  name: 'shannon.frontPlacket',
  from: front,
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

    return part
  },
}
