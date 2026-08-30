import { pctBasedOn } from '@freesewing/core'
import { frontBase } from './frontBase.mjs'

export const centreFront = {
  name: 'denny.centreFront',
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
    const keepPaths = ['byronGuide', 'hemCurveInitial']
    for (const name in paths) {
      if (keepPaths.indexOf(name) === -1) delete paths[name]
    }
    //let's begin
    //paths
    paths.hemBase = new Path()
      .move(points.hemEx)
      .line(points.buttonholeHem)
      .join(paths.hemCurveInitial.split(points.centreFrontHemRight)[0])
      .hide()

    paths.seam = paths.hemBase
      .clone()
      .line(points.frontTopLeft)
      .line(points.yokeEx)
      .line(points.hemEx)
      .close()
      .unhide()

    if (complete) {
      //grainline
      points.grainlineFrom = points.buttonholeYoke.shiftFractionTowards(points.frontTopLeft, 0.5)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.centreFrontHemRight.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      snippets.frontPocketLeft = new Snippet('notch', points.frontPocketLeft)
      //title
      points.title = new Point(
        points.yokeEx.x * 0.5,
        (points.centreFrontHemRight.y + points.frontTopLeft.y) * 0.5
      )
      macro('title', {
        at: points.title,
        nr: '2',
        title: 'Centre Front',
        cutNr: 2,
        scale: 1 / 3,
      })
      //buttonholes
      for (let i = 0; i < options.buttonholeNum - 1; i++) {
        if (points['buttonhole' + i].y > points.yokeEx.y) {
          snippets['buttonhole' + i] = new Snippet('buttonhole', points['buttonhole' + i]).attr(
            'data-rotate',
            90
          )
          snippets['button' + i] = new Snippet('button', points['buttonhole' + i])
        }
      }
      //facing line
      paths.facingLine = new Path()
        .move(points.buttonholeHem)
        .line(points.facingCurveStart)
        .curve(points.facingCurveStartCp2, points.shoulderFacingCp1, points.shoulderFacing)
        .split(points.frontPocketTarget)[0]
        .attr('class', 'fabric help')
        .attr('data-text', 'Facing - Line')
        .attr('data-text-class', 'center')
      if (sa) {
        const frontPanelSa = sa * options.frontPanelSaWidth * 100

        points.saHemEx = points.hemEx.translate(-sa, sa)
        points.saCentreFrontHemRight = utils.beamsIntersect(
          paths.hemBase.offset(sa).shiftFractionAlong(0.995),
          paths.hemBase.offset(sa).end(),
          points.centreFrontHemRight
            .shiftTowards(points.frontTopLeft, frontPanelSa)
            .rotate(-90, points.centreFrontHemRight),
          points.frontTopLeft
            .shiftTowards(points.centreFrontHemRight, frontPanelSa)
            .rotate(90, points.frontTopLeft)
        )

        points.saFrontTopLeft = utils.beamIntersectsY(
          points.saCentreFrontHemRight,
          points.saCentreFrontHemRight.shift(
            points.centreFrontHemRight.angle(points.frontTopLeft),
            1
          ),
          points.frontTopLeft.y - frontPanelSa
        )

        points.saYokeEx = new Point(points.saHemEx.x, points.saFrontTopLeft.y)

        paths.sa = paths.hemBase
          .clone()
          .offset(sa)
          .line(points.saCentreFrontHemRight)
          .line(points.saFrontTopLeft)
          .line(points.saYokeEx)
          .line(points.saHemEx)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
