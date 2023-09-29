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
    // paths.daisyGuide = new Path()
    // .move(points.cbWaist)
    // .line(points.dartBottomLeft)
    // .line(points.dartTip)
    // .line(points.dartBottomRight)
    // .line(points.sideWaist)
    // .line(points.armhole)
    // .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
    // .curve_(points.armholePitchCp2, points.shoulder)
    // .line(points.hps)
    // ._curve(points.cbNeckCp1, points.cbNeck)
    // .line(points.cbWaist)
    // .attr('class', 'various lashed')
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

    points.dartBottomLeftCp = points.dartBottomLeft.shiftFractionTowards(points.dartTip, 7 / 6)
    points.armholeSplitCp = points.armholeSplit.shiftFractionTowards(points.dartTip, 7 / 6)

    //paths
    paths.hemBase = new Path().move(points.cbWaist).line(points.dartBottomLeft).hide()

    paths.princessSeam = new Path()
      .move(points.dartBottomLeft)
      .curve(points.dartBottomLeftCp, points.armholeSplitCp, points.armholeSplit)
      .hide()

    paths.shoulder = new Path().move(points.shoulder).line(points.hps).hide()

    paths.cbNeck = new Path().move(points.hps)._curve(points.cbNeckCp1, points.cbNeck).hide()

    paths.cb = new Path().move(points.cbNeck).line(points.cbWaist).hide()

    paths.seam = paths.hemBase
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
      points.grainlineFrom = points.cbNeck.shiftFractionTowards(points.cbNeckCp1, 0.25)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.cbWaist.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
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
        scale: 0.75,
      })
      if (sa) {
        const princessSa = sa * options.princessSaWidth * 100
        const neckSa = sa * options.neckSaWidth * 100

        points.saPoint0 = utils.beamsIntersect(
          points.cbWaist.shiftTowards(points.dartBottomLeft, sa).rotate(-90, points.cbWaist),
          points.dartBottomLeft.shiftTowards(points.cbWaist, sa).rotate(90, points.dartBottomLeft),
          points.dartBottomLeft
            .shiftTowards(points.dartTip, princessSa)
            .rotate(-90, points.dartBottomLeft),
          points.dartTip.shiftTowards(points.dartBottomLeft, princessSa).rotate(90, points.dartTip)
        )
        points.saPoint1 = points.saPoint3
        points.saPoint2 = points.saPoint4
        points.saPoint3 = points.saPoint5
        points.saPoint4 = points.saPoint6

        paths.saArmhole = new Path()
          .move(points.saArmhole)
          .curve(points.saArmholeCp2, points.saArmholePitchCp1, points.saArmholePitch)
          .curve_(points.saArmholePitchCp2, points.saShoulder)
          .line(points.saPoint1)
          .hide()

        points.saArmholeSplit = paths.saArmhole.shiftFractionAlong(1 - options.bustDartFraction)

        if (options.bustDartFraction > 0.01 && options.bustDartFraction < 0.997) {
          paths.saArmhole = paths.saArmhole.split(points.saArmholeSplit)[1].hide()
        } else {
          if (options.bustDartFraction <= 0.01) {
            paths.saArmhole = new Path().move(points.saPoint1).line(points.saPoint1).hide()
          }
        }

        paths.sa = paths.hemBase
          .clone()
          .offset(sa)
          .line(points.saPoint0)
          .line(paths.princessSeam.offset(princessSa).start())
          .join(paths.princessSeam.offset(princessSa))
          .join(paths.saArmhole)
          .line(points.saPoint1)
          .line(points.saPoint2)
          .line(paths.cbNeck.offset(neckSa).start())
          .join(paths.cbNeck.offset(neckSa))
          .line(points.saPoint3)
          .line(points.saPoint4)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
