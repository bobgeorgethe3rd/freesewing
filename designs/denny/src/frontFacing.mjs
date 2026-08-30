import { pctBasedOn } from '@freesewing/core'
import { frontBase } from './frontBase.mjs'

export const frontFacing = {
  name: 'denny.frontFacing',
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
    const keepPaths = ['byronGuide', 'cfNeck']
    for (const name in paths) {
      if (keepPaths.indexOf(name) === -1) delete paths[name]
    }
    //paths
    paths.facingCurve = new Path()
      .move(points.buttonholeHem)
      .line(points.facingCurveStart)
      .curve(points.facingCurveStartCp2, points.shoulderFacingCp1, points.shoulderFacing)
      .hide()

    paths.cfNeck = paths.cfNeck.split(points.neckSplit)[1].line(points.cfNeckEx).hide()

    paths.seam = new Path()
      .move(points.hemEx)
      .line(points.buttonholeHem)
      .join(paths.facingCurve)
      .line(points.neckSplit)
      .join(paths.cfNeck)
      .line(points.hemEx)
      .close()

    if (complete) {
      //grainline
      points.grainlineFrom = new Point((points.cfNeckEx.x * 2) / 3, points.cfNeckEx.y)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.hemEx.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      snippets.cfNeck = new Snippet('notch', points.cfNeck)
      //title
      points.title = new Point(points.cfNeckEx.x * 0.4, (points.cfNeck.y + points.hemEx.y) * 0.5)
      macro('title', {
        at: points.title,
        nr: '5',
        title: 'Front Facing',
        cutNr: 2,
        scale: 0.5,
      })
      //buttonholes
      for (let i = 0; i < options.buttonholeNum - 1; i++) {
        snippets['buttonhole' + i] = new Snippet('buttonhole', points['buttonhole' + i]).attr(
          'data-rotate',
          90
        )
        snippets['button' + i] = new Snippet('button', points['buttonhole' + i])
      }

      if (sa) {
        const shoulderSa = sa * options.shoulderSaWidth * 100
        const neckSa = sa * options.neckSaWidth * 100

        points.saHemEx = points.hemEx.translate(-sa, sa)
        points.saButtonholeHem = points.buttonholeHem.translate(sa, sa)

        points.saShoulderFacing = utils.beamsIntersect(
          paths.facingCurve.offset(sa).end(),
          paths.facingCurve
            .offset(sa)
            .end()
            .shift(points.shoulderFacing.angle(points.neckSplit) - 90, 1),
          points.shoulderFacing
            .shiftTowards(points.neckSplit, shoulderSa)
            .rotate(-90, points.shoulderFacing),
          points.neckSplit
            .shiftTowards(points.shoulderFacing, shoulderSa)
            .rotate(90, points.neckSplit)
        )

        points.saNeckSplit = utils.beamsIntersect(
          points.saShoulderFacing,
          points.saShoulderFacing.shift(points.shoulderFacing.angle(points.neckSplit), 1),
          paths.cfNeck.offset(neckSa).start(),
          paths.cfNeck
            .offset(neckSa)
            .start()
            .shift(points.neckSplit.angle(points.shoulderFacing) + 90, 1)
        )

        points.saCfNeckEx = points.cfNeckEx.translate(-sa, -neckSa)

        paths.sa = new Path()
          .move(points.saHemEx)
          .line(points.saButtonholeHem)
          .join(paths.facingCurve.offset(sa))
          .line(points.saShoulderFacing)
          .line(points.saNeckSplit)
          .join(paths.cfNeck.offset(neckSa))
          .line(points.saCfNeckEx)
          .line(points.saHemEx)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
