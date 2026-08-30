import { pctBasedOn } from '@freesewing/core'
import { backBase } from './backBase.mjs'

export const yokeBack = {
  name: 'denny.yokeBack',
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
    const keepPaths = ['byronGuide', 'cfNeck', 'cbNeck']
    for (const name in paths) {
      if (keepPaths.indexOf(name) === -1) delete paths[name]
    }
    //let's begin
    //paths
    paths.armhole = new Path()
      .move(points.armholePitch)
      .curve_(points.armholePitchCp2, points.shoulder)
      ._curve(points.frontArmholePitchCp1, points.frontArmholePitch)
      .split(points.armholeSplit)[0]
      .hide()

    paths.cbNeck = paths.cfNeck.split(points.neckSplit)[1].join(paths.cbNeck).hide()

    paths.seam = new Path()
      .move(points.cbYoke)
      .line(points.armholePitch)
      .join(paths.armhole)
      .line(points.neckSplit)
      .join(paths.cbNeck)
      .line(points.cbYoke)
      .close()

    if (complete) {
      //grainline
      if (options.cbSaWidth == 0) {
        points.cutOnFoldFrom = points.cbNeck
        points.cutOnFoldTo = points.cbYoke
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
      } else {
        points.grainlineTo = points.cbNeck.shiftFractionTowards(points.cbNeckCp1, 0.25)
        points.grainlineFrom = new Point(points.grainlineTo.x, points.cbYoke.y)
        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
      }
      //notches
      macro('sprinkle', {
        snippet: 'notch',
        on: ['shoulder', 'hps'],
      })
      snippets.armholePitch = new Snippet('bnotch', points.armholePitch)
      //title
      points.title = new Point(points.hps.x, (points.cbNeck.y + points.cbYoke.y) * 0.5)
      macro('title', {
        at: points.title,
        nr: '6',
        title: 'Yoke Back',
        cutNr: options.cbSaWidth == 0 ? 1 : 2,
        scale: 0.5,
      })
      if (sa) {
        const backPanelSa = sa * options.backPanelSaWidth * 100
        const armholeSa = sa * options.armholeSaWidth * 100
        const shoulderSa = sa * options.shoulderSaWidth * 100
        const neckSa = sa * options.neckSaWidth * 100
        const cbSa = sa * options.cbSaWidth * 100

        points.saCbYoke = points.cbYoke.translate(-cbSa, backPanelSa)
        points.saArmholePitch = points.armholePitch.translate(armholeSa, backPanelSa)

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
          paths.cbNeck.offset(neckSa).start(),
          paths.cbNeck
            .offset(neckSa)
            .start()
            .shift(points.neckSplit.angle(points.armholeSplit) + 90, 1)
        )

        points.saCbNeck = points.cbNeck.translate(-cbSa, -neckSa)

        paths.sa = new Path()
          .move(points.saCbYoke)
          .line(points.saArmholePitch)
          .join(paths.armhole.offset(armholeSa))
          .line(points.saArmholeSplit)
          .line(points.saNeckSplit)
          .join(paths.cbNeck.offset(neckSa))
          .line(points.saCbNeck)
          .line(points.saCbYoke)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
