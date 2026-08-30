import { pctBasedOn } from '@freesewing/core'
import { backBase } from './backBase.mjs'

export const sideBack = {
  name: 'denny.sideBack',
  from: backBase,
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
    //paths
    paths.hemBase = new Path().move(points.hemLeft).curve_(points.hemLeftCp2, points.sideHem).hide()

    paths.sideSeam = new Path()
      .move(points.sideHem)
      .curve_(points.sideHemCp2, points.armhole)
      .hide()

    paths.armhole = new Path()
      .move(points.armhole)
      .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
      .hide()

    paths.seam = paths.hemBase
      .clone()
      .join(paths.sideSeam)
      .join(paths.armhole)
      .line(points.yokeAnchor)
      .line(points.hemLeft)
      .close()

    if (complete) {
      //grainline
      points.grainlineFrom = points.yokeAnchor.shiftFractionTowards(points.armholePitch, 0.25)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.sideHem.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      points.sleeveBackNotch = paths.armhole.reverse().shiftAlong(store.get('sleeveBackDrop'))
      macro('sprinkle', {
        snippet: 'bnotch',
        on: ['armholePitch', 'sleeveBackNotch'],
      })
      //title
      points.title = new Point(
        points.yokeAnchor.shiftFractionTowards(points.armholePitch, 0.75).x,
        points.sideHemCp2.y
      )
      macro('title', {
        at: points.title,
        nr: '8',
        title: 'Side Back',
        cutNr: 2,
        scale: 0.5,
      })
      if (sa) {
        const sideSeamSa = sa * options.sideSeamSaWidth * 100
        const armholeSa = sa * options.armholeSaWidth * 100
        const backPanelSa = sa * options.backPanelSaWidth * 100

        points.saSideHem = points.sideHem.translate(sideSeamSa, sa)
        points.saArmhole = utils.beamIntersectsY(
          points.sideHemCp2.shiftTowards(points.armhole, sideSeamSa).rotate(-90, points.sideHemCp2),
          points.armhole.shiftTowards(points.sideHemCp2, sideSeamSa).rotate(90, points.armhole),
          points.armhole.y - armholeSa
        )
        points.saArmholePitch = points.armholePitch.translate(armholeSa, -backPanelSa)

        points.saYokeAnchor = points.yokeAnchor.translate(-backPanelSa, -backPanelSa)

        points.saHemLeft = utils.beamIntersectsX(
          points.hemLeft.shiftTowards(points.hemLeftCp2, sa).rotate(-90, points.hemLeft),
          points.hemLeftCp2.shiftTowards(points.hemLeft, sa).rotate(90, points.hemLeftCp2),
          points.hemLeft.x - backPanelSa
        )

        paths.sa = paths.hemBase
          .clone()
          .offset(sa)
          .line(points.saSideHem)
          .join(paths.sideSeam.offset(sideSeamSa))
          .line(points.saArmhole)
          .join(paths.armhole.offset(armholeSa))
          .line(points.saArmholePitch)
          .line(points.saYokeAnchor)
          .line(points.saHemLeft)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
