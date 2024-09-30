export const backArmhole = {
  name: 'peach.backArmhole',
  draft: ({
    store,
    sa,
    points,
    Point,
    Path,
    paths,
    complete,
    paperless,
    macro,
    part,
    options,
    snippets,
    Snippet,
    utils,
  }) => {
    //removing paths and snippets not required from Daisy
    for (let i in paths) delete paths[i]
    for (let i in snippets) delete snippets[i]
    //removing macros not required from Daisy
    macro('title', false)
    //guides
    if (options.daisyGuides) {
      paths.daisyGuide = new Path()
        .move(points.cbWaist)
        .line(points.dartBottomLeft)
        .line(points.dartTip)
        .line(points.dartBottomRight)
        .line(points.sideWaist)
        .line(points.armhole)
        .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
        .curve_(points.armholePitchCp2, points.shoulder)
        .line(points.hps)
        ._curve(points.cbNeckCp1, points.cbNeck)
        .line(points.cbWaist)
        .attr('class', 'various lashed')
    }
    //let's begin

    paths.armhole = new Path()
      .move(points.armhole)
      .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
      .curve_(points.armholePitchCp2, points.shoulder)
      .hide()

    points.armholeSplit = paths.armhole.shiftFractionAlong(1 - options.bustDartFraction)

    if (options.bustDartFraction > 0.01 && options.bustDartFraction < 0.997) {
      paths.armhole = paths.armhole.split(points.armholeSplit)[1].hide()
    } else {
      if (options.bustDartFraction <= 0.01) {
        paths.armhole = new Path().move(points.armholeSplit).line(points.shoulder).hide()
      }
    }

    points.dartBottomLeftCp2 = points.dartTip
    points.armholeSplitCpCp1 = points.dartTip

    //paths
    paths.waist = new Path().move(points.cbWaist).line(points.dartBottomLeft).hide()

    paths.princessSeam = new Path()
      .move(points.dartBottomLeft)
      .curve(points.dartBottomLeftCp2, points.armholeSplitCpCp1, points.armholeSplit)
      .hide()

    paths.shoulder = new Path().move(points.shoulder).line(points.hps).hide()

    paths.cbNeck = new Path().move(points.hps)._curve(points.cbNeckCp1, points.cbNeck).hide()

    paths.cb = new Path().move(points.cbNeck).line(points.cbWaist).hide()

    paths.seam = paths.waist
      .clone()
      .join(paths.princessSeam)
      .join(paths.armhole)
      .join(paths.shoulder)
      .join(paths.cbNeck)
      .join(paths.cb)

    //stores
    store.set('princessSeamBackLengthA', paths.princessSeam.length())

    if (complete) {
      //grainline
      let titleCutNum
      if (options.closurePosition != 'back' && options.cbSaWidth == 0) {
        points.cutOnFoldFrom = points.cbNeck
        points.cutOnFoldTo = points.cbWaist
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
        titleCutNum = 1
      } else {
        points.grainlineFrom = points.cbNeck.shiftFractionTowards(points.cbNeckCp1, 0.25)
        points.grainlineTo = new Point(points.grainlineFrom.x, points.cbWaist.y)
        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
        titleCutNum = 2
      }
      //notches
      points.princessNotch0 = paths.princessSeam.shiftFractionAlong(0.25)
      points.princessNotch1 = paths.princessSeam.shiftFractionAlong(0.75)
      macro('sprinkle', {
        snippet: 'bnotch',
        on: ['princessNotch0', 'princessNotch1', 'cArmhole'],
      })
      //title
      macro('title', {
        at: points.title,
        nr: '3',
        title: 'Back',
        cutNr: titleCutNum,
        scale: 0.75,
      })
      if (sa) {
        const princessSa = sa * options.princessSaWidth * 100
        const neckSa = sa * options.neckSaWidth * 100
        const armholeSa = sa * options.armholeSaWidth * 100

        points.saDartBottomLeft = utils.beamsIntersect(
          points.cbWaist.shiftTowards(points.dartBottomLeft, sa).rotate(-90, points.cbWaist),
          points.dartBottomLeft.shiftTowards(points.cbWaist, sa).rotate(90, points.dartBottomLeft),
          points.dartBottomLeft
            .shiftTowards(points.dartTip, princessSa)
            .rotate(-90, points.dartBottomLeft),
          points.dartTip.shiftTowards(points.dartBottomLeft, princessSa).rotate(90, points.dartTip)
        )

        if (options.bustDartFraction > 0.01) {
          paths.saArmhole = paths.armhole.offset(armholeSa).hide()
        } else {
          if (options.bustDartFraction <= 0.01) {
            paths.saArmhole = new Path()
              .move(points.saShoulderCorner)
              .line(points.saShoulderCorner)
              .hide()
          }
        }

        points.saArmholeTop = paths.saArmhole
          .shiftFractionAlong(0.001)
          .shiftOutwards(paths.saArmhole.start(), sa)
        points.saPrincessSeamEnd = paths.princessSeam.offset(princessSa).end()

        if (
          points.saArmholeTop.y > points.saPrincessSeamEnd.y ||
          options.bustDartFraction <= 0.01
        ) {
          points.saArmholeTop = points.saPrincessSeamEnd
        }
        points.saArmholeBottom = utils.beamsIntersect(
          points.saArmholeTop,
          points.saArmholeTop.shift(-90, 1),
          paths.princessSeam.offset(princessSa).shiftFractionAlong(0.999),
          points.saPrincessSeamEnd
        )

        paths.sa = new Path()
          .move(points.saCbWaist)
          .line(points.saDartBottomLeft)
          .line(paths.princessSeam.offset(princessSa).start())
          .join(paths.princessSeam.offset(princessSa))
          .line(points.saArmholeBottom)
          .line(points.saArmholeTop)
          .join(paths.saArmhole)
          .line(points.saShoulderCorner)
          .line(points.saHps)
          .line(paths.cbNeck.offset(neckSa).start())
          .join(paths.cbNeck.offset(neckSa))
          .line(points.saCbNeck)
          .line(points.saCbWaist)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
