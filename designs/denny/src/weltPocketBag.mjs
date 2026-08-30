import { pctBasedOn } from '@freesewing/core'
import { frontBase } from './frontBase.mjs'

export const weltPocketBag = {
  name: 'denny.weltPocketBag',
  from: [frontBase],
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Pockets
    weltPocketBagWidth: { pct: 50, min: 40, max: 60, menu: 'pockets.weltPockets' },
    //Construction
    weltPocketBagSaWidth: { pct: 1.5, min: 1, max: 3, menu: 'construction' },
  },
  draft: ({
    store,
    sa,
    Point,
    points,
    Path,
    paths,
    options,
    absoluteOptions,
    complete,
    paperless,
    macro,
    measurements,
    part,
    snippets,
    Snippet,
    utils,
  }) => {
    //set render
    if (!options.weltPocketBool) {
      part.hide()
      return part
    }
    //removing paths and snippets not required from Base
    const keepPaths = ['byronGuide']
    for (const name in paths) {
      if (keepPaths.indexOf(name) === -1) delete paths[name]
    }
    //remove macros
    macro('title', false)
    //measurements
    const weltPocketBagWidth =
      measurements.hpsToWaistBack * options.weltPocketPlacement * options.weltPocketBagWidth
    const sideFrontAngle =
      points.frontTopRight.angle(points.sideFrontHemLeft) -
      points.frontTopRight.angle(points.frontHemRight)
    //let's begin
    const rot = ['frontHemLeft', 'frontHemLeftCp2', 'frontHemRight']
    for (const p of rot) points[p] = points[p].rotate(sideFrontAngle, points.frontTopRight)

    points.weltPocketTopRight = points.weltPocketOpeningTopRight
      .shift(points.sideFrontHemLeft.angle(points.frontTopRight), weltPocketBagWidth)
      .shift(points.sideFrontHemLeft.angle(points.frontTopRight) - 90, weltPocketBagWidth)

    points.weltPocketTopLeft = utils.beamsIntersect(
      points.weltPocketTopRight,
      points.weltPocketTopRight.shift(points.sideFrontHemLeft.angle(points.frontTopRight) + 90, 1),
      points.frontHemLeft,
      points.frontTopLeft
    )

    points.weltPocketBottomRight = utils.lineIntersectsCurve(
      points.weltPocketTopRight,
      points.weltPocketTopRight.shift(
        points.frontTopRight.angle(points.sideFrontHemLeft),
        points.frontTopRight.dist(points.sideFrontHemLeft)
      ),
      points.sideFrontHemLeft,
      points.sideFrontHemLeftCp2,
      points.sideHem,
      points.sideHem
    )

    //paths
    paths.hemBase = new Path()
      .move(points.frontHemLeft)
      .curve_(points.frontHemLeftCp2, points.frontHemRight)
      .curve_(points.sideFrontHemLeftCp2, points.sideHem)
      .split(points.weltPocketBottomRight)[0]
      .hide()

    paths.seam = paths.hemBase
      .clone()
      .line(points.weltPocketTopRight)
      .line(points.weltPocketTopLeft)
      .line(points.frontHemLeft)
      .unhide()

    if (complete) {
      //grainline
      points.grainlineTo = paths.hemBase.shiftFractionAlong(0.25)
      points.grainlineFrom = utils.beamsIntersect(
        points.grainlineTo,
        points.grainlineTo.shift(points.weltPocketBottomRight.angle(points.weltPocketTopRight), 1),
        points.weltPocketTopRight,
        points.weltPocketTopLeft
      )
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //title
      points.title = paths.hemBase
        .shiftFractionAlong(0.4)
        .shiftFractionTowards(
          utils.beamsIntersect(
            paths.hemBase.shiftFractionAlong(0.4),
            paths.hemBase
              .shiftFractionAlong(0.4)
              .shift(points.weltPocketBottomRight.angle(points.weltPocketTopRight), 1),
            points.weltPocketTopRight,
            points.weltPocketTopLeft
          ),
          0.5
        )
      macro('title', {
        at: points.title,
        nr: '14',
        title: 'Welt Pocket Bag',
        cutNr: 2,
        scale: 0.5,
        rotation: 90 - points.weltPocketBottomRight.angle(points.weltPocketTopRight),
      })
      //opening
      paths.weltPocketOpening = new Path()
        .move(points.weltPocketOpeningBottomLeft)
        .line(points.weltPocketOpeningBottomRight)
        .line(points.weltPocketOpeningTopRight)
        .line(points.weltPocketOpeningTopLeft)
        .line(points.weltPocketOpeningBottomLeft)
        .close()
        .attr('class', 'mark')

      paths.weltPocketLine = new Path()
        .move(points.weltPocketOpeningTopLeft)
        .line(points.weltPocketOpeningBottomLeft)
        .attr('class', 'mark hidden')
        .attr('data-text', 'Welt Pocket Opening')
        .attr('data-text-class', 'center')

      if (sa) {
        const weltPocketBagSa = sa * options.weltPocketBagSaWidth * 100
        const frontPanelSa = sa * options.frontPanelSaWidth * 100

        points.saWeltPocketBottomRight = utils.beamsIntersect(
          paths.hemBase.offset(sa).shiftFractionAlong(0.995),
          paths.hemBase.offset(sa).end(),
          points.weltPocketBottomRight
            .shiftTowards(points.weltPocketTopRight, weltPocketBagSa)
            .rotate(-90, points.weltPocketBottomRight),
          points.weltPocketTopRight
            .shiftTowards(points.weltPocketBottomRight, weltPocketBagSa)
            .rotate(-90, points.weltPocketTopRight)
        )

        points.saWeltPocketTopRight = utils.beamsIntersect(
          points.weltPocketBottomRight
            .shiftTowards(points.weltPocketTopRight, weltPocketBagSa)
            .rotate(-90, points.weltPocketBottomRight),
          points.weltPocketTopRight
            .shiftTowards(points.weltPocketBottomRight, weltPocketBagSa)
            .rotate(90, points.weltPocketTopRight),
          points.weltPocketTopRight
            .shiftTowards(points.weltPocketTopLeft, weltPocketBagSa)
            .rotate(-90, points.weltPocketTopRight),
          points.weltPocketTopLeft
            .shiftTowards(points.weltPocketTopRight, weltPocketBagSa)
            .rotate(90, points.weltPocketTopLeft)
        )

        points.saWeltPocketTopLeft = utils.beamsIntersect(
          points.weltPocketTopRight
            .shiftTowards(points.weltPocketTopLeft, weltPocketBagSa)
            .rotate(-90, points.weltPocketTopRight),
          points.weltPocketTopLeft
            .shiftTowards(points.weltPocketTopRight, weltPocketBagSa)
            .rotate(90, points.weltPocketTopLeft),
          points.weltPocketTopLeft
            .shiftTowards(points.frontHemLeft, frontPanelSa)
            .rotate(-90, points.weltPocketTopLeft),
          points.frontHemLeft
            .shiftTowards(points.weltPocketTopLeft, frontPanelSa)
            .rotate(90, points.frontHemLeft)
        )

        points.saWeltPocketBottomLeft = utils.beamsIntersect(
          points.weltPocketTopLeft
            .shiftTowards(points.frontHemLeft, frontPanelSa)
            .rotate(-90, points.weltPocketTopLeft),
          points.frontHemLeft
            .shiftTowards(points.weltPocketTopLeft, frontPanelSa)
            .rotate(90, points.frontHemLeft),
          paths.hemBase.offset(sa).shiftFractionAlong(0.005),
          paths.hemBase.offset(sa).start()
        )

        paths.sa = paths.hemBase
          .clone()
          .offset(sa)
          .line(points.saWeltPocketBottomRight)
          .line(points.saWeltPocketTopRight)
          .line(points.saWeltPocketTopLeft)
          .line(points.saWeltPocketBottomLeft)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
