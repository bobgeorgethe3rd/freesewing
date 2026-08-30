import { pctBasedOn } from '@freesewing/core'
import { frontBase } from './frontBase.mjs'

export const yokeFront = {
  name: 'denny.yokeFront',
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
    const keepPaths = ['byronGuide', 'armhole', 'cfNeck']
    for (const name in paths) {
      if (keepPaths.indexOf(name) === -1) delete paths[name]
    }
    //let's begin
    //paths
    paths.armhole = paths.armhole.split(points.yokeSplit)[1].split(points.armholeSplit)[0].hide()

    paths.cfNeck = paths.cfNeck.split(points.neckSplit)[1].line(points.cfNeckEx).hide()

    paths.seam = new Path()
      .move(points.yokeEx)
      .line(points.yokeSplit)
      .join(paths.armhole)
      .line(points.neckSplit)
      .join(paths.cfNeck)
      .line(points.yokeEx)
      .close()

    if (complete) {
      //grainline
      points.grainlineFrom = new Point(points.neckSplit.x, points.armholeSplit.y)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.yokeEx.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      macro('sprinkle', {
        snippet: 'notch',
        on: ['armholePitch', 'frontPocketLeft', 'frontPocketRight'],
      })
      //title
      points.title = new Point(
        points.neckSplit.x * 1.5,
        (points.yokeSplit.y + points.armholeSplit.y) * 0.5
      )
      macro('title', {
        at: points.title,
        nr: '1',
        title: 'Yoke Front',
        cutNr: 2,
        scale: 2 / 3,
      })
      //buttonholes
      for (let i = 0; i < options.buttonholeNum - 1; i++) {
        if (points['buttonhole' + i].y < points.yokeEx.y) {
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
        .split(points.frontPocketTarget)[1]
        .attr('class', 'fabric help')
        .attr('data-text', 'Facing - Line')
        .attr('data-text-class', 'center')

      if (sa) {
        const frontPanelSa = sa * options.frontPanelSaWidth * 100
        const armholeSa = sa * options.armholeSaWidth * 100
        const shoulderSa = sa * options.shoulderSaWidth * 100
        const neckSa = sa * options.neckSaWidth * 100

        points.saYokeEx = points.yokeEx.translate(-sa, frontPanelSa)
        points.saYokeSplit = new Point(paths.armhole.offset(armholeSa).start().x, points.saYokeEx.y)

        points.saArmholeSplit = utils.beamsIntersect(
          paths.armhole.offset(armholeSa).end(),
          paths.armhole
            .offset(armholeSa)
            .end()
            .shift(points.armholeSplit.angle(points.neckSplit) - 90, 1),
          points.armholeSplit
            .shiftTowards(points.neckSplit, shoulderSa)
            .rotate(-90, points.armholeSplit),
          points.neckSplit
            .shiftTowards(points.armholeSplit, shoulderSa)
            .rotate(90, points.neckSplit)
        )

        points.saNeckSplit = utils.beamsIntersect(
          points.saArmholeSplit,
          points.saArmholeSplit.shift(points.armholeSplit.angle(points.neckSplit), 1),
          paths.cfNeck.offset(neckSa).start(),
          paths.cfNeck
            .offset(neckSa)
            .start()
            .shift(points.neckSplit.angle(points.armholeSplit) + 90, 1)
        )

        points.saCfNeckEx = points.cfNeckEx.translate(-sa, -neckSa)

        paths.sa = new Path()
          .move(points.saYokeEx)
          .line(points.saYokeSplit)
          .join(paths.armhole.offset(armholeSa))
          .line(points.saArmholeSplit)
          .line(points.saNeckSplit)
          .join(paths.cfNeck.offset(neckSa))
          .line(points.saCfNeckEx)
          .line(points.saYokeEx)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
