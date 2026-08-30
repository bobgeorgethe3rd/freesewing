import { pctBasedOn } from '@freesewing/core'
import { weltPocketBag } from './weltPocketBag.mjs'

export const weltPocketWelt = {
  name: 'denny.weltPocketWelt',
  from: [weltPocketBag],
  options: {},
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
    const keepPaths = ['byronGuide', 'hemBase', 'weltPocketOpening', 'weltPocketLine']
    for (const name in paths) {
      if (keepPaths.indexOf(name) === -1) delete paths[name]
    }
    //remove macros
    macro('title', false)
    //measurements
    const weltPocketWeltWidth = store.get('weltPocketWeltWidth')
    //let's begin

    const weltPocketHemSplit = utils.lineIntersectsCurve(
      points.weltPocketOpeningTopLeft.shift(
        points.weltPocketOpeningTopRight.angle(points.weltPocketOpeningTopLeft),
        weltPocketWeltWidth * 2.5
      ),
      points.weltPocketOpeningTopLeft
        .shift(
          points.weltPocketOpeningTopRight.angle(points.weltPocketOpeningTopLeft),
          weltPocketWeltWidth * 2.5
        )
        .shift(
          points.weltPocketTopLeft.angle(points.frontHemLeft),
          points.weltPocketTopLeft.dist(points.frontHemLeft) * 10
        ),
      points.sideFrontHemLeft,
      points.sideFrontHemLeftCp2,
      points.sideHem,
      points.sideHem
    )

    if (weltPocketHemSplit) {
      points.weltPocketHemSplit = weltPocketHemSplit
    } else {
      points.weltPocketHemSplit = utils.lineIntersectsCurve(
        points.weltPocketOpeningTopLeft.shift(
          points.weltPocketOpeningTopRight.angle(points.weltPocketOpeningTopLeft),
          weltPocketWeltWidth * 2.5
        ),
        points.weltPocketOpeningTopLeft
          .shift(
            points.weltPocketOpeningTopRight.angle(points.weltPocketOpeningTopLeft),
            weltPocketWeltWidth * 2.5
          )
          .shift(
            points.weltPocketTopLeft.angle(points.frontHemLeft),
            points.weltPocketTopLeft.dist(points.frontHemLeft) * 10
          ),
        points.frontHemLeft,
        points.frontHemLeftCp2,
        points.frontHemRight,
        points.frontHemRight
      )
    }
    points.weltPocketTopSplit = utils.beamsIntersect(
      points.weltPocketHemSplit,
      points.weltPocketHemSplit.shift(
        points.weltPocketBottomRight.angle(points.weltPocketTopRight),
        1
      ),
      points.weltPocketTopRight,
      points.weltPocketTopLeft
    )
    //paths
    paths.hemBase = paths.hemBase.split(points.weltPocketHemSplit)[1].hide()

    paths.seam = paths.hemBase
      .clone()
      .line(points.weltPocketTopRight)
      .line(points.weltPocketTopSplit)
      .line(points.weltPocketHemSplit)
      .close()
      .unhide()

    if (complete) {
      //grainline
      points.grainlineTo = paths.hemBase.shiftFractionAlong(0.15)
      points.grainlineFrom = utils.beamsIntersect(
        points.grainlineTo,
        points.grainlineTo.shift(points.weltPocketBottomRight.angle(points.weltPocketTopRight), 1),
        points.weltPocketTopRight,
        points.weltPocketTopSplit
      )
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //title
      points.title = paths.hemBase
        .shiftFractionAlong(0.25)
        .shiftFractionTowards(
          utils.beamsIntersect(
            paths.hemBase.shiftFractionAlong(0.25),
            paths.hemBase
              .shiftFractionAlong(0.25)
              .shift(points.weltPocketBottomRight.angle(points.weltPocketTopRight), 1),
            points.weltPocketTopRight,
            points.weltPocketTopLeft
          ),
          0.5
        )
      macro('title', {
        at: points.title,
        nr: '15',
        title: 'Welt Pocket Welt',
        cutNr: 2,
        scale: 0.25,
        rotation: 90 - points.weltPocketBottomRight.angle(points.weltPocketTopRight),
      })

      if (sa) {
        const weltPocketBagSa = sa * options.weltPocketBagSaWidth * 100
        const frontPanelSa = sa * options.frontPanelSaWidth * 100

        points.saWeltPocketTopSplit = utils.beamsIntersect(
          points.weltPocketTopRight
            .shiftTowards(points.weltPocketTopLeft, weltPocketBagSa)
            .rotate(-90, points.weltPocketTopRight),
          points.weltPocketTopLeft
            .shiftTowards(points.weltPocketTopRight, weltPocketBagSa)
            .rotate(90, points.weltPocketTopLeft),
          points.weltPocketTopSplit
            .shiftTowards(points.weltPocketHemSplit, sa)
            .rotate(-90, points.weltPocketTopSplit),
          points.weltPocketHemSplit
            .shiftTowards(points.weltPocketTopSplit, sa)
            .rotate(90, points.weltPocketHemSplit)
        )
        points.saWeltHemSplit = utils.beamsIntersect(
          points.weltPocketTopSplit
            .shiftTowards(points.weltPocketHemSplit, sa)
            .rotate(-90, points.weltPocketTopSplit),
          points.weltPocketHemSplit
            .shiftTowards(points.weltPocketTopSplit, sa)
            .rotate(90, points.weltPocketHemSplit),
          paths.hemBase.offset(sa).shiftFractionAlong(0.005),
          paths.hemBase.offset(sa).start()
        )

        paths.sa = paths.hemBase
          .clone()
          .offset(sa)
          .line(points.saWeltPocketBottomRight)
          .line(points.saWeltPocketTopRight)
          .line(points.saWeltPocketTopSplit)
          .line(points.saWeltHemSplit)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
