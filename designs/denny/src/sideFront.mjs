import { pctBasedOn } from '@freesewing/core'
import { frontBase } from './frontBase.mjs'

export const sideFront = {
  name: 'denny.sideFront',
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
    const keepPaths = ['byronGuide', 'armhole']
    for (const name in paths) {
      if (keepPaths.indexOf(name) === -1) delete paths[name]
    }
    //let's begin
    //paths
    paths.hemBase = new Path()
      .move(points.sideFrontHemLeft)
      .curve_(points.sideFrontHemLeftCp2, points.sideHem)
      .hide()

    paths.sideSeam = new Path()
      .move(points.sideHem)
      .curve_(points.sideHemCp2, points.armhole)
      .hide()

    paths.armhole = paths.armhole.split(points.yokeSplit)[0]

    paths.seam = paths.hemBase
      .clone()
      .join(paths.sideSeam)
      .join(paths.armhole)
      .line(points.frontTopRight)
      .line(points.sideFrontHemLeft)
      .close()
      .unhide()

    if (complete) {
      //grainline
      points.grainlineTo = points.sideFrontHemLeft.shiftFractionTowards(
        points.sideFrontHemLeftCp2,
        0.25
      )
      points.grainlineFrom = new Point(points.grainlineTo.x, points.yokeSplit.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      snippets.frontPocketRight = new Snippet('notch', points.frontPocketRight)
      //title
      points.title = new Point(points.yokeSplit.x, (points.armhole.y + points.sideHem.y) * 0.5)
      macro('title', {
        at: points.title,
        nr: '4',
        title: 'Side Front',
        cutNr: 2,
        scale: 1 / 3,
      })

      if (sa) {
        const sideSeamSa = sa * options.sideSeamSaWidth * 100
        const armholeSa = sa * options.armholeSaWidth * 100
        const frontPanelSa = sa * options.frontPanelSaWidth * 100

        points.saSideHem = utils.beamIntersectsX(
          points.sideFrontHemLeftCp2
            .shiftTowards(points.sideHem, sa)
            .rotate(-90, points.sideFrontHemLeftCp2),
          points.sideHem.shiftTowards(points.sideFrontHemLeftCp2, sa).rotate(90, points.sideHem),
          points.sideHem.x + sideSeamSa
        )

        points.saArmhole = utils.beamIntersectsY(
          points.sideHemCp2.shiftTowards(points.armhole, sideSeamSa).rotate(-90, points.sideHemCp2),
          points.armhole.shiftTowards(points.sideHemCp2, sideSeamSa).rotate(90, points.armhole),
          points.armhole.y - armholeSa
        )

        points.saYokeSplit = new Point(
          paths.armhole.offset(armholeSa).end().x,
          points.yokeSplit.y - frontPanelSa
        )

        points.saFrontTopRight = utils.beamIntersectsY(
          points.frontTopRight
            .shiftTowards(points.sideFrontHemLeft, frontPanelSa)
            .rotate(-90, points.frontTopRight),
          points.sideFrontHemLeft
            .shiftTowards(points.frontTopRight, frontPanelSa)
            .rotate(90, points.sideFrontHemLeft),
          points.frontTopRight.y - frontPanelSa
        )

        points.saSideFrontHemLeft = utils.beamsIntersect(
          points.saFrontTopRight,
          points.saFrontTopRight.shift(points.frontTopRight.angle(points.sideFrontHemLeft), 1),
          points.sideFrontHemLeft
            .shiftTowards(points.sideFrontHemLeftCp2, sa)
            .rotate(-90, points.sideFrontHemLeft),
          points.sideFrontHemLeftCp2
            .shiftTowards(points.sideFrontHemLeft, sa)
            .rotate(90, points.sideFrontHemLeftCp2)
        )

        paths.sa = paths.hemBase
          .clone()
          .offset(sa)
          .line(points.saSideHem)
          .join(paths.sideSeam.offset(sideSeamSa))
          .line(points.saArmhole)
          .join(paths.armhole.offset(armholeSa))
          .line(points.saYokeSplit)
          .line(points.saFrontTopRight)
          .line(points.saSideFrontHemLeft)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
