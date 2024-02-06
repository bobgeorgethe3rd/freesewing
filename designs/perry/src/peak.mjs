import { pctBasedOn } from '@freesewing/core'
import { crown } from './crown.mjs'

export const peak = {
  name: 'perry.peak',
  after: crown,
  options: {
    //Constants
    cpFraction: 0.55191502449,
    //Style
    peak: { bool: true, menu: 'style' },
    peakWidth: { pct: 6.5, min: 4.9, max: 8.2, snap: 5, ...pctBasedOn('head'), menu: 'style' },
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
    //set render
    if (!options.peak) {
      part.hide()
      return part
    }
    //measures
    void store.setIfUnset(
      'headCircumference',
      measurements.head + 635 * options.headEase,
      log.info('Head Ease has been set at ' + utils.units(635 * options.headEase))
    )
    void store.setIfUnset('headRadius', store.get('headCircumference') / 2 / Math.PI)

    const headRadius = store.get('headRadius')
    const peakWidth = absoluteOptions.peakWidth

    //let's begin
    points.origin = new Point(0, 0)
    points.innerOrigin = points.origin.shift(90, peakWidth)

    points.bottomOuter = points.origin.shift(-90, headRadius)
    points.bottomInner = points.innerOrigin.shift(-90, headRadius)

    points.rightOuter = points.origin.shift(0, headRadius)
    points.rightInnerI = points.innerOrigin.shift(0, headRadius)

    points.topOuter = points.origin.shift(90, headRadius)

    points.innerCpAnchor = new Point(points.rightInnerI.x, points.bottomInner.y)
    points.outerCpAnchor = new Point(points.rightOuter.x, points.topOuter.y)

    points.topOuterCp1 = points.topOuter.shiftFractionTowards(
      points.outerCpAnchor,
      options.cpFraction
    )
    points.rightOuterCp2 = points.rightOuter.shiftFractionTowards(
      points.outerCpAnchor,
      options.cpFraction
    )

    points.bottomInnerCp1I = points.bottomInner.shiftFractionTowards(
      points.innerCpAnchor,
      options.cpFraction
    )
    points.rightInnerICp2 = points.rightInnerI.shiftFractionTowards(
      points.innerCpAnchor,
      options.cpFraction
    )

    // points.rightInner = utils.curvesIntersect(
    // points.rightOuter,
    // points.rightOuterCp2,
    // points.topOuterCp1,
    // points.topOuter,
    // points.rightInnerI,
    // points.rightInnerICp2,
    // points.bottomInnerCp1I,
    // points.bottomInner
    // )

    points.rightInner = points.origin.translate(
      Math.sqrt(Math.pow(headRadius, 2) - Math.pow(peakWidth / 2, 2)),
      peakWidth * -0.5
    )

    const outerAngle = points.origin.angle(points.rightInner) + 90
    const innerAngle = points.innerOrigin.angle(points.rightInner) - 270
    const outerCpDistance = (4 / 3) * headRadius * Math.tan(utils.deg2rad(outerAngle / 4))
    const innerCpDistance = (4 / 3) * headRadius * Math.tan(utils.deg2rad(innerAngle / 4))

    points.leftInner = points.rightInner.flipX()

    points.bottomOuterCp2 = points.bottomOuter.shift(0, outerCpDistance)
    points.rightInnerCp1 = points.rightInner
      .shiftTowards(points.origin, outerCpDistance)
      .rotate(90, points.rightInner)
    points.rightInnerCp2 = points.rightInner
      .shiftTowards(points.innerOrigin, innerCpDistance)
      .rotate(90, points.rightInner)
    points.bottomInnerCp1 = points.bottomInner.shift(0, innerCpDistance)

    points.bottomInnerCp2 = points.bottomInnerCp1.flipX()
    points.leftInnerCp1 = points.rightInnerCp2.flipX()
    points.leftInnerCp2 = points.rightInnerCp1.flipX()
    points.bottomOuterCp1 = points.bottomOuterCp2.flipX()

    //guides
    // paths.intersectGuide = new Path()
    // .move(points.rightOuter)
    // .curve(points.rightOuterCp2, points.topOuterCp1, points.topOuter)
    // .line(points.origin)
    // .move(points.rightInnerI)
    // .curve(points.rightInnerICp2, points.bottomInnerCp1I, points.bottomInner)
    // .line(points.innerOrigin)
    // .attr('class', 'various')

    //paths
    paths.hemBase = new Path()
      .move(points.rightInner)
      .curve(points.rightInnerCp2, points.bottomInnerCp1, points.bottomInner)
      .curve(points.bottomInnerCp2, points.leftInnerCp1, points.leftInner)
      .hide()

    paths.saBase = new Path()
      .move(points.leftInner)
      .curve(points.leftInnerCp2, points.bottomOuterCp1, points.bottomOuter)
      .curve(points.bottomOuterCp2, points.rightInnerCp1, points.rightInner)
      .hide()

    paths.seam = paths.hemBase.clone().join(paths.saBase).close()

    if (complete) {
      //grainline
      points.grainlineFrom = points.bottomInner.shiftFractionTowards(points.bottomInnerCp2, 1 / 3)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.bottomOuter.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      snippets.bottomInnerNotch = new Snippet('notch', points.bottomInner)
      //title
      points.title = new Point(points.bottomInnerCp2.x * 0.75, points.bottomInner.y + peakWidth / 2)
      macro('title', {
        at: points.title,
        nr: '3',
        title: 'Peak',
        scale: 0.25,
      })
      //centre line
      paths.centreLine = new Path()
        .move(points.bottomInner)
        .line(points.bottomOuter)
        .attr('class', 'mark')
        .attr('data-text', 'Centre Line')
        .attr('data-text-class', 'center')

      if (sa) {
        const hemSa = sa * options.crownSaWidth * 100

        points.saHemBaseEnd = points.leftInner.rotate(-90, paths.hemBase.offset(hemSa).end())

        points.saLeftInner = utils.beamsIntersect(
          points.saHemBaseEnd,
          points.saHemBaseEnd.shift(180, 1),
          points.leftInner.shiftTowards(points.leftInnerCp2, sa).rotate(-90, points.leftInner),
          points.leftInnerCp2.shiftTowards(points.leftInner, sa).rotate(90, points.leftInnerCp2)
        )

        points.saHemBaseStart = points.saHemBaseEnd.flipX()
        points.saRightInner = points.saLeftInner.flipX()

        paths.sa = new Path()
          .move(points.saHemBaseStart)
          .line(paths.hemBase.offset(hemSa).start())
          .join(paths.hemBase.offset(hemSa))
          .line(points.saHemBaseEnd)
          .line(points.saLeftInner)
          .line(paths.saBase.offset(sa).start())
          .join(paths.saBase.offset(sa))
          .line(points.saRightInner)
          .line(points.saHemBaseStart)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
