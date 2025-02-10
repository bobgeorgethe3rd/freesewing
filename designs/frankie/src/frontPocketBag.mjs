import { frontBase } from './frontBase.mjs'

export const frontPocketBag = {
  name: 'frankie.frontPocketBag',
  from: frontBase,
  hide: {
    from: true,
  },
  options: {
    //Pockets
    frontPocketWidth: { pct: 60, min: 30, max: 70, menu: 'pockets.frontPockets' },
    frontPocketDepth: { pct: 15, min: 10, max: 20, menu: 'pockets.frontPockets' },
    //Construction
    frontPocketBagSaWidth: { pct: 1.5, min: 1, max: 3, menu: 'construction' },
  },
  draft: ({
    store,
    sa,
    Point,
    points,
    Path,
    paths,
    options,
    paperless,
    complete,
    macro,
    utils,
    part,
    snippets,
    Snippet,
  }) => {
    //let's begin
    points.frontPocketOutDepth = paths.outSeam.shiftAlong(
      store.get('frontPocketOpeningDepth') * 2 + store.get('frontPocketOpeningLength')
    )
    points.frontPocketWaist = points.styleWaistOut.shiftFractionTowards(
      points.styleWaistIn,
      options.frontPocketWidth
    )
    points.frontPocketCurveEnd = utils.beamsIntersect(
      points.frontPocketOutDepth,
      points.frontPocketOutDepth.shift(points.styleWaistOut.angle(points.styleWaistIn), 1),
      points.frontPocketWaist,
      points.frontPocketWaist.shift(points.styleWaistOut.angle(points.styleWaistIn) - 80, 1)
    )
    points.frontPocketBottom = points.frontPocketOutDepth
      .shiftFractionTowards(points.frontPocketCurveEnd, 0.55)
      .shift(
        points.styleWaistOut.angle(points.styleWaistIn) - 90,
        paths.outSeam.length() * options.frontPocketDepth
      )
    points.frontPocketOutDepthCp2 = points.frontPocketOutDepth.shiftFractionTowards(
      points.frontPocketCurveEnd,
      0.25
    )
    points.frontPocketBottomCp1 = points.frontPocketBottom.shift(
      points.styleWaistIn.angle(points.styleWaistOut),
      points.frontPocketOutDepth.dist(points.frontPocketCurveEnd) * 0.5
    )
    points.frontPocketBottomCpTarget = utils.beamsIntersect(
      points.frontPocketBottom,
      points.frontPocketBottom.shift(points.styleWaistOut.angle(points.styleWaistIn), 1),
      points.frontPocketWaist,
      points.frontPocketCurveEnd
    )
    points.frontPocketBottomCp2 = points.frontPocketBottom.shiftFractionTowards(
      points.frontPocketBottomCpTarget,
      2 / 3
    )
    points.frontPocketCurveEndCp1 = points.frontPocketCurveEnd.shiftFractionTowards(
      points.frontPocketBottomCpTarget,
      2 / 3
    )
    //paths
    paths.saBottom = new Path()
      .move(points.frontPocketOutDepth)
      .curve(points.frontPocketOutDepthCp2, points.frontPocketBottomCp1, points.frontPocketBottom)
      .curve(points.frontPocketBottomCp2, points.frontPocketCurveEndCp1, points.frontPocketCurveEnd)
      .line(points.frontPocketWaist)
      .hide()

    paths.waist = new Path().move(points.frontPocketWaist).line(points.styleWaistOut).hide()

    paths.outSeam = paths.outSeam.split(points.frontPocketOutDepth)[0]

    paths.seam = paths.saBottom
      .clone()
      .join(paths.waist)
      .join(paths.outSeam)
      .close()
      .setClass('fabric')

    if (sa) {
      paths.sa = paths.saBottom
        .offset(sa * options.frontPocketBagSaWidth * 100)
        .join(paths.waist.offset(sa))
        .join(paths.outSeam.offset(sa * options.sideSeamSaWidth * 100))
        .close()
        .setClass('fabric sa')
    }

    //details
    //grainline

    //notches
    macro('sprinkle', {
      snippet: 'notch',
      on: ['frontPocketOpeningTop', 'frontPocketOpeningBottom'],
    })

    return part
  },
}
