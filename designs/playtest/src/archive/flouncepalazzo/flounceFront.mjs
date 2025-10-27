import { front } from './front.mjs'

export const flounceFront = {
  name: 'playtest.flounceFront',
  after: front,
  options: {
    //Constants
    cpFraction: 0.55191502449,
    //Style
    flounceFrontMinLength: { pct: 75, min: 0, max: 100, menu: 'style' },
    flounceFrontSegmentNum: { count: 12, min: 4, max: 16, menu: 'style' },
  },
  draft: ({
    options,
    Point,
    Path,
    points,
    paths,
    Snippet,
    snippets,
    utils,
    measurements,
    complete,
    store,
    sa,
    paperless,
    macro,
    part,
  }) => {
    //measures
    const flounceFrontWidth = store.get('flounceFrontWidth')
    const flounceFrontMinLength =
      store.get('toUpperLeg') * (1 - options.flounceFrontMinLength) +
      measurements.waistToKnee * options.flounceFrontMinLength
    const flounceFrontRadius = (flounceFrontWidth * options.flounceFrontSegmentNum) / Math.PI
    const flounceFrontWaistCpDist = flounceFrontRadius * options.cpFraction

    //let's begin
    points.origin = new Point(0, 0)
    points.waistLeft = points.origin.shift(180, flounceFrontRadius)
    points.waistRight = points.waistLeft.flipX(points.origin)
    points.waistBottom = points.origin.shift(-90, flounceFrontRadius)
    points.waistRightCp2 = points.waistRight.shift(-90, flounceFrontWaistCpDist)
    points.waistBottomCp1 = points.waistBottom.shift(0, flounceFrontWaistCpDist)
    points.waistBottomCp2 = points.waistBottomCp1.flipX(points.origin)
    points.waistLeftCp1 = points.waistRightCp2.flipX(points.origin)

    points.hemLeft = points.waistLeft.shift(180, store.get('flounceSeamLength'))
    points.hemBottom = points.waistBottom.shift(-90, flounceFrontMinLength)
    points.hemRight = points.hemLeft.flipX(points.origin)

    const flounceFrontHemSideCpDist = points.hemBottom.y * options.cpFraction
    const flounceFrontHemBottomCpDist = points.hemRight.x * options.cpFraction

    points.hemLeftCp2 = points.hemLeft.shift(-90, flounceFrontHemSideCpDist)
    points.hemBottomCp1 = points.hemBottom.shift(180, flounceFrontHemBottomCpDist)
    points.hemBottomCp2 = points.hemBottomCp1.flipX(points.origin)
    points.hemRightCp1 = points.hemLeftCp2.flipX(points.origin)

    //paths
    paths.hemBase = new Path()
      .move(points.hemLeft)
      .curve(points.hemLeftCp2, points.hemBottomCp1, points.hemBottom)
      .curve(points.hemBottomCp2, points.hemRightCp1, points.hemRight)
      .hide()

    paths.waist = new Path()
      .move(points.waistRight)
      .curve(points.waistRightCp2, points.waistBottomCp1, points.waistBottom)
      .curve(points.waistBottomCp2, points.waistLeftCp1, points.waistLeft)
      .hide()

    paths.seam = paths.hemBase
      .clone()
      .line(points.waistRight)
      .join(paths.waist)
      .line(points.hemLeft)
      .close()

    if (complete) {
      //grainline
      points.grainlineFrom = paths.waist.shiftFractionAlong(0.9)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.hemBottom.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //title
      points.title = new Point(points.waistRight.x, points.hemBottom.y * 0.5)
      macro('title', {
        nr: 4,
        title: 'Flounce Front',
        at: points.title,
        cutNr: 1,
        scale: 0.5,
      })
      //foldlines
      for (let i = 0; i < options.flounceFrontSegmentNum - 1; i++) {
        points['foldFrom' + i] = paths.waist.shiftFractionAlong(
          (i + 1) / options.flounceFrontSegmentNum
        )

        // points['foldTo' + i] = paths.hemBase.reverse().shiftFractionAlong((i + 1) / options.flounceFrontSegmentNum)

        const foldIntersect = utils.lineIntersectsCurve(
          points.origin,
          points.origin.shiftOutwards(points['foldFrom' + i], points.hemRight.x),
          points.hemLeft,
          points.hemLeftCp2,
          points.hemBottomCp1,
          points.hemBottom
        )

        if (foldIntersect) {
          points['foldTo' + i] = foldIntersect
        } else {
          points['foldTo' + i] = utils.lineIntersectsCurve(
            points.origin,
            points.origin.shiftOutwards(points['foldFrom' + i], points.hemRight.x),
            points.hemBottom,
            points.hemBottomCp2,
            points.hemRightCp1,
            points.hemRight
          )
        }

        if (!points['foldFrom' + i].sitsOn(points.waistBottom)) {
          paths['foldline' + i] = new Path()
            .move(points['foldFrom' + i])
            .line(points['foldTo' + i])
            .attr('class', 'fabric help')
            .attr('data-text', 'Fold-line')
            .attr('data-text-class', 'center')
        }
      }
      //mid lines
      paths.midline = new Path()
        .move(points.waistBottom)
        .line(points.hemBottom)
        .attr('class', 'mark')
        .attr('data-text', 'Mid-line')
        .attr('data-text-class', 'center')

      points.waistSplitRight = paths.waist.shiftAlong(
        flounceFrontWidth * options.flounceFrontSegmentNum * 0.5 - flounceFrontWidth
      )
      points.waistSplitLeft = points.waistSplitRight.flipX(points.origin)

      paths.waistMid = paths.waist
        .split(points.waistSplitRight)[1]
        .split(points.waistSplitLeft)[0]
        .reverse()
        .attr('class', 'mark')
        .attr('data-text', 'Mid-line')
        .attr('data-text-class', 'center')

      if (sa) {
        const hemSa = sa * options.hemWidth * 100
        const flounceSa = sa * options.flounceSaWidth * 100

        points.saHemRight = points.hemRight.translate(hemSa, -flounceSa)
        points.saWaistRight = points.waistRight.translate(-sa, -flounceSa)
        points.saWaistLeft = points.saWaistRight.flipX(points.origin)
        points.saHemLeft = points.saHemRight.flipX(points.origin)

        paths.sa = paths.hemBase
          .offset(hemSa)
          .line(points.saHemRight)
          .line(points.saWaistRight)
          .join(paths.waist.offset(sa))
          .line(points.saWaistLeft)
          .line(points.saHemLeft)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
