import { pctBasedOn } from '@freesewing/core'
import { frontBase } from './frontBase.mjs'

export const weltPocketBag = {
  name: 'denny.weltPocketBag',
  from: [frontBase],
  options: {
    //Pockets
    weltPocketBagWidth: { pct: 50, min: 40, max: 60, menu: 'pockets.weltPockets' },
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
    //removing paths and snippets not required from Base
    const keepPaths = ['byronGuide', 'welt']
    for (const name in paths) {
      if (keepPaths.indexOf(name) === -1) delete paths[name]
    }
    for (let i in snippets) delete snippets[i]
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

    points.weltPocketTopRight = points.weltTopRight
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

    return part
  },
}
