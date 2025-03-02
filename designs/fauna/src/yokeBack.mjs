import { backBase } from './backBase.mjs'

export const yokeBack = {
  name: 'fauna.yokeBack',
  from: backBase,
  hide: {
    from: true,
    // inherited: true,
  },
  options: {
    yokeBackOnBias: { bool: false, menu: 'style' },
  },
  draft: ({
    store,
    sa,
    Point,
    points,
    Path,
    paths,
    options,
    complete,
    paperless,
    macro,
    utils,
    measurements,
    part,
    snippets,
    Snippet,
  }) => {
    //delete inherited paths
    const keepThese = ['daisyGuide']
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    //paths
    paths.armhole = new Path()
      .move(points.armhole)
      .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
      .curve_(points.armholePitchCp2, points.shoulder)
      .split(points.yokeBackSplit)[1]
      .hide()

    paths.cbNeck = new Path().move(points.hps)._curve(points.cbNeckCp1, points.cbNeck).hide()

    paths.seamBase = new Path()
      .move(points.cbYoke)
      .line(points.yokeBackSplit)
      .join(paths.armhole)
      .line(points.hps)
      .join(paths.cbNeck)
      .hide()

    macro('mirror', {
      mirror: [points.cbNeck, points.cbWaist],
      paths: ['seamBase'],
      prefix: 'm',
    })

    paths.seam =
      options.yokeBackOnBias && options.cbSaWidth == 0
        ? paths.seamBase.join(paths.mSeamBase.reverse()).close().unhide()
        : paths.seamBase.line(points.cbYoke).close().unhide()

    if (complete) {
      //grainline
      if (options.yokeBackOnBias) {
        points.grainlineFrom = points.cbNeck
        points.grainlineTo = utils.beamIntersectsY(
          points.cbNeck,
          points.cbNeck.shift(315, 1),
          points.cbYoke.y
        )
        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
      } else {
        if (options.cbSaWidth == 0) {
          points.cutOnFoldFrom = points.cbNeck.shiftFractionTowards(points.cbYoke, 0.1)
          points.cutOnFoldTo = points.cbYoke.shiftFractionTowards(points.cbNeck, 0.1)
          macro('cutonfold', {
            from: points.cutOnFoldFrom,
            to: points.cutOnFoldTo,
            grainline: true,
          })
        } else {
          points.grainlineTo = new Point(
            points.cbWaist.shiftFractionTowards(points.dartBottomLeft, 0.15).x,
            points.cbYoke.y
          )
          points.grainlineFrom = new Point(points.grainlineTo.x, points.cbNeck.y)
          macro('grainline', {
            from: points.grainlineFrom,
            to: points.grainlineTo,
          })
        }
      }
      //notches
      if (points.armholePitch.y < points.yokeBackSplit.y)
        snippets.armholePitch = new Snippet('bnotch', points.armholePitch)

      snippets.cbYoke = new Snippet('bnotch', points.cbYoke)
      //title
      points.title = new Point(points.title.x, (points.cbNeck.y + points.cbYoke.y) / 2)
      macro('title', {
        at: points.title,
        nr: '1',
        title: 'Yoke Back',
        cutNr: options.cbSaWidth == 0 ? 2 : 4,
        scale: 0.5,
      })
      if (sa) {
        const armholeSa = sa * options.armholeSaWidth * 100
        const neckSa = sa * options.neckSaWidth * 100
        const shoulderSa = sa * options.shoulderSaWidth * 100

        paths.saArmhole = paths.armhole.offset(armholeSa).hide()

        points.saCbYoke = new Point(points.saCbNeck.x, points.cbYoke.y + sa)
        points.saYokeBackSplit = utils.beamIntersectsY(
          paths.saArmhole.start(),
          paths.saArmhole.shiftFractionAlong(0.005),
          points.saCbYoke.y
        )

        points.saShoulderCorner = points.shoulder
          .shift(points.armholePitchCp2.angle(points.shoulder) - 90, armholeSa)
          .shift(points.armholePitchCp2.angle(points.shoulder), shoulderSa)

        points.saHps = utils.beamsIntersect(
          paths.cbNeck.offset(neckSa).start(),
          paths.cbNeck
            .offset(neckSa)
            .start()
            .shift(points.hps.angle(points.shoulder) + 90, 1),
          points.saShoulderCorner,
          points.saShoulderCorner.shift(points.shoulder.angle(points.hps), 1)
        )

        paths.saBase = new Path()
          .move(points.saCbYoke)
          .line(points.saYokeBackSplit)
          .join(paths.saArmhole)
          .line(points.saShoulderCorner)
          .line(points.saHps)
          .join(paths.cbNeck.offset(neckSa))
          .hide()

        macro('mirror', {
          mirror: [points.cbNeck, points.cbWaist],
          paths: ['saBase'],
          prefix: 'm',
        })

        paths.sa =
          options.yokeBackOnBias && options.cbSaWidth == 0
            ? paths.saBase.join(paths.mSaBase.reverse()).close().attr('class', 'fabric sa')
            : paths.saBase
                .line(points.saCbNeck)
                .line(points.saCbYoke)
                .close()
                .attr('class', 'fabric sa')
                .unhide()
      }
    }

    return part
  },
}
