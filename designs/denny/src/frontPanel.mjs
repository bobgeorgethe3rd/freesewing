import { pctBasedOn } from '@freesewing/core'
import { pluginBundle } from '@freesewing/plugin-bundle'
import { frontBase } from './frontBase.mjs'

export const frontPanel = {
  name: 'denny.frontPanel',
  from: frontBase,
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
    const keepPaths = ['byronGuide']
    for (const name in paths) {
      if (keepPaths.indexOf(name) === -1) delete paths[name]
    }
    //let's begin
    paths.hemBase = new Path()
      .move(points.frontHemLeft)
      .curve_(points.frontHemLeftCp2, points.frontHemRight)
      .hide()

    paths.seam = paths.hemBase
      .clone()
      .line(points.frontTopRight)
      .line(points.frontTopLeft)
      .line(points.frontHemLeft)
      .close()
      .unhide()

    if (complete) {
      //grainline
      points.grainlineFrom = points.frontTopLeft.shiftFractionTowards(points.frontTopRight, 0.25)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.frontHemLeft.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //title
      points.title = new Point(
        points.frontTopLeft.shiftFractionTowards(points.frontTopRight, 0.4).x,
        (points.frontTopRight.y + points.frontHemRight.y) * 0.5
      )
      macro('title', {
        at: points.title,
        nr: '3',
        title: 'Front Panel',
        cutNr: 2,
        scale: 1 / 3,
      })

      if (sa) {
        const frontPanelSa = sa * options.frontPanelSaWidth * 100

        points.saFrontHemRight = utils.beamsIntersect(
          points.frontHemLeftCp2
            .shiftTowards(points.frontHemRight, sa)
            .rotate(-90, points.frontHemLeftCp2),
          points.frontHemRight
            .shiftTowards(points.frontHemLeftCp2, sa)
            .rotate(90, points.frontHemRight),
          points.frontHemRight
            .shiftTowards(points.frontTopRight, frontPanelSa)
            .rotate(-90, points.frontHemRight),
          points.frontTopRight
            .shiftTowards(points.frontHemRight, frontPanelSa)
            .rotate(90, points.frontTopRight)
        )

        points.saFrontTopRight = utils.beamIntersectsY(
          points.saFrontHemRight,
          points.saFrontHemRight.shift(points.frontHemRight.angle(points.frontTopRight), 1),
          points.frontTopRight.y - frontPanelSa
        )

        points.saFrontTopLeft = utils.beamIntersectsY(
          points.frontTopLeft
            .shiftTowards(points.frontHemLeft, frontPanelSa)
            .rotate(-90, points.frontTopLeft),
          points.frontHemLeft
            .shiftTowards(points.frontTopLeft, frontPanelSa)
            .rotate(90, points.frontHemLeft),
          points.frontTopLeft.y - frontPanelSa
        )

        points.saFrontHemLeft = utils.beamsIntersect(
          points.saFrontTopLeft,
          points.saFrontTopLeft.shift(points.frontTopLeft.angle(points.frontHemLeft), 1),
          points.frontHemLeft
            .shiftTowards(points.frontHemLeftCp2, sa)
            .rotate(-90, points.frontHemLeft),
          points.frontHemLeftCp2
            .shiftTowards(points.frontHemLeft, sa)
            .rotate(90, points.frontHemLeftCp2)
        )

        paths.sa = paths.hemBase
          .clone()
          .offset(sa)
          .line(points.saFrontHemRight)
          .line(points.saFrontTopRight)
          .line(points.saFrontTopLeft)
          .line(points.saFrontHemLeft)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
