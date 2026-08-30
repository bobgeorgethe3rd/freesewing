import { pctBasedOn } from '@freesewing/core'
import { backBase } from './backBase.mjs'

export const centreBack = {
  name: 'denny.centreBack',
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
    paths.seam = new Path()
      .move(points.cbHem)
      .line(points.centreHemRight)
      .line(points.yokeAnchor)
      .line(points.cbYoke)
      .line(points.cbHem)
      .close()

    if (complete) {
      //grainline
      if (options.cbSaWidth == 0) {
        points.cutOnFoldFrom = points.cbYoke
        points.cutOnFoldTo = points.cbHem
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
      } else {
        points.grainlineTo = points.cbYoke.shiftFractionTowards(points.yokeAnchor, 0.15)
        points.grainlineFrom = new Point(points.grainlineTo.x, points.cbHem.y)
        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
      }
      //title
      points.title = new Point(
        points.centreHemRight.x * 0.4,
        (points.cbYoke.y + points.cbHem.y) * 0.5
      )
      macro('title', {
        at: points.title,
        nr: '7',
        title: 'Centre Back',
        cutNr: options.cbSaWidth == 0 ? 1 : 2,
        scale: 0.5,
      })
      if (sa) {
        const backPanelSa = sa * options.backPanelSaWidth * 100
        const cbSa = sa * options.cbSaWidth * 100

        points.saCbHem = points.cbHem.translate(-cbSa, sa)
        points.saCentreHemRight = utils.beamIntersectsY(
          points.centreHemRight
            .shiftTowards(points.yokeAnchor, backPanelSa)
            .rotate(-90, points.centreHemRight),
          points.yokeAnchor
            .shiftTowards(points.centreHemRight, backPanelSa)
            .rotate(90, points.yokeAnchor),
          points.centreHemRight.y + sa
        )
        points.saYokeAnchor = utils.beamIntersectsY(
          points.saCentreHemRight,
          points.saCentreHemRight.shift(points.centreHemRight.angle(points.yokeAnchor), 1),
          points.yokeAnchor.y - backPanelSa
        )

        points.saCbYoke = points.cbYoke.translate(-cbSa, -backPanelSa)

        paths.sa = new Path()
          .move(points.saCbHem)
          .line(points.saCentreHemRight)
          .line(points.saYokeAnchor)
          .line(points.saCbYoke)
          .line(points.saCbHem)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
