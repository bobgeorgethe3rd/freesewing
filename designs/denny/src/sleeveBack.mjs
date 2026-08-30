import { pctBasedOn } from '@freesewing/core'
import { sleeveBase } from './sleeveBase.mjs'

export const sleeveBack = {
  name: 'denny.sleeveBack',
  from: sleeveBase,
  hide: {
    from: true,
    inherited: true,
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
    log,
    utils,
  }) => {
    //removing paths and snippets not required from Byron
    const keepPaths = ['sleeveGuide', 'sleevecap']
    for (const name in paths) {
      if (keepPaths.indexOf(name) === -1) delete paths[name]
    }
    //let's begin
    //paths
    paths.backCurve = new Path()
      .move(points.backBottomRight)
      ._curve(points.backBottomCurveEndCp1, points.backBottomCurveEnd)
      .line(points.sleevecapSplit)
      .hide()

    paths.sleevecap = paths.sleevecap.split(points.sleevecapSplit)[1].hide()

    paths.seam = new Path()
      .move(points.bottomLeft)
      .line(points.backBottomRight)
      .join(paths.backCurve)
      .join(paths.sleevecap)
      .line(points.bottomLeft)
      .close()

    if (complete) {
      //grainline
      points.grainlineTo = points.bottomLeft.shiftFractionTowards(points.backBottomRight, 0.5)
      points.grainlineFrom = utils.beamIntersectsX(
        points.backBottomRight,
        points.sleevecapSplit,
        points.grainlineTo.x
      )
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //title
      points.title = new Point(
        paths.sleevecap.shiftFractionAlong(0.5).x,
        utils.beamIntersectsX(
          points.backBottomRight,
          points.sleevecapSplit,
          points.bottomLeft.shiftFractionTowards(points.backBottomRight, 0.5).x
        ).y
      )
      macro('title', {
        at: points.title,
        nr: '9',
        title: 'Sleeve Back',
        cutNr: 2,
        scale: 0.5,
      })
      if (sa) {
        const sleevePanelSa = sa * options.sleevePanelSaWidth * 100
        const armholeSa = sa * options.armholeSaWidth * 100
        const sideSeamSa = sa * options.sideSeamSaWidth * 100

        if (points.midAnchor.dist(points.bottomAnchor) <= 0 || !options.fitSleeveWidth) {
          points.saTopLeft = points.sleeveCapLeft.shift(180, sideSeamSa)
          points.saBottomLeft = points.bottomLeft.shift(180, sideSeamSa)
        } else {
          points.saTopLeft = utils.beamIntersectsY(
            points.sleeveCapLeft
              .shiftTowards(points.bottomLeft, sideSeamSa)
              .rotate(-90, points.sleeveCapLeft),
            points.bottomLeft
              .shiftTowards(points.sleeveCapLeft, sideSeamSa)
              .rotate(90, points.bottomLeft),
            points.sleeveCapLeft.y
          )
          points.saBottomLeft = points.bottomLeft
            .shiftTowards(points.sleeveCapLeft, sideSeamSa)
            .rotate(90, points.bottomLeft)
        }
        points.saSleeveCapLeft = utils.beamIntersectsY(
          points.saTopLeft,
          points.saTopLeft.shift(90, 1),
          paths.sleevecap.offset(armholeSa).end().y
        )

        points.saBottomLeftCorner = new Point(points.saBottomLeft.x, points.bottomLeft.y + sa)

        points.saBackBottomRight = utils.beamIntersectsY(
          points.backBottomRight
            .shiftTowards(points.backBottomCurveEndCp1, sleevePanelSa)
            .rotate(-90, points.backBottomRight),
          points.backBottomCurveEndCp1
            .shiftTowards(points.backBottomRight, sleevePanelSa)
            .rotate(90, points.backBottomCurveEndCp1),
          points.backBottomRight.y + sa
        )

        points.saSleevecapSplit = utils.beamsIntersect(
          points.backBottomCurveEnd
            .shiftTowards(points.sleevecapSplit, sleevePanelSa)
            .rotate(-90, points.backBottomCurveEnd),
          points.sleevecapSplit
            .shiftTowards(points.backBottomCurveEnd, sleevePanelSa)
            .rotate(90, points.sleevecapSplit),
          paths.sleevecap.offset(armholeSa).shiftFractionAlong(0.005),
          paths.sleevecap.offset(armholeSa).start()
        )

        paths.sa = new Path()
          .move(points.saBottomLeftCorner)
          .line(points.saBackBottomRight)
          .join(paths.backCurve.offset(sleevePanelSa))
          .line(points.saSleevecapSplit)
          .join(paths.sleevecap.offset(armholeSa))
          .line(points.saSleeveCapLeft)
          .line(points.saTopLeft)
          .line(points.saBottomLeft)
          .line(points.saBottomLeftCorner)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
